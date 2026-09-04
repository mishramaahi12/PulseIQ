import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Crown,
  IndianRupee,
  Package,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./analytics.css";

const API_URL = "http://127.0.0.1:8000";


// =========================================================
// HELPERS
// =========================================================

function getUserId() {
  try {
    const user = JSON.parse(
      localStorage.getItem("pulseiq_user") || "{}"
    );

    return (
      user?.id ||
      user?.user_id ||
      user?.email ||
      user?.username ||
      "1"
    );
  } catch {
    return "1";
  }
}


function getStoredData() {
  try {
    const stored = localStorage.getItem("pulseiq_business_data");

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) return parsed;

    if (Array.isArray(parsed?.rows)) return parsed.rows;

    if (Array.isArray(parsed?.data)) return parsed.data;

    return [];
  } catch {
    return [];
  }
}


function getValue(row, keys, fallback = "") {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ""
    ) {
      return row[key];
    }
  }

  return fallback;
}


function getCustomer(row) {
  return String(
    getValue(row, [
      "customerName",
      "customer_name",
      "customer",
      "Customer Name",
      "Customer",
      "client",
      "Client",
      "buyer",
      "Buyer",
    ], "Unknown Customer")
  ).trim();
}


function getProduct(row) {
  return String(
    getValue(row, [
      "product",
      "productName",
      "product_name",
      "Product",
      "Product Name",
      "item",
      "Item",
      "description",
      "Description",
    ], "Unknown Product")
  ).trim();
}


function getQuantity(row) {
  const raw = getValue(row, [
    "quantity",
    "qty",
    "Quantity",
    "Qty",
    "units",
    "Units",
  ], 1);

  const value = Number(
    String(raw).replace(/,/g, "").replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(value) && value > 0 ? value : 1;
}


function getAmount(row) {
  const raw = getValue(row, [
    "totalAmount",
    "total_amount",
    "amount",
    "Amount",
    "total",
    "Total",
    "revenue",
    "Revenue",
    "sales",
    "Sales",
    "price",
    "Price",
  ], 0);

  const cleaned = String(raw)
    .replace(/[₹$€£,\s]/g, "")
    .replace(/[^\d.-]/g, "");

  const value = Number(cleaned);

  return Number.isFinite(value) ? value : 0;
}


function getPayment(row) {
  return String(
    getValue(row, [
      "paymentStatus",
      "payment_status",
      "Payment Status",
      "payment",
      "Payment",
      "status",
      "Status",
    ], "Pending")
  )
    .trim()
    .toLowerCase();
}


function getDate(row) {
  return getValue(row, [
    "purchaseDate",
    "purchase_date",
    "Purchase Date",
    "date",
    "Date",
    "orderDate",
    "order_date",
    "Order Date",
    "created_at",
    "createdAt",
    "invoiceDate",
    "invoice_date",
  ], "");
}


function getInvoice(row) {
  return String(
    getValue(row, [
      "invoiceNumber",
      "invoice_number",
      "invoiceNo",
      "invoice_no",
      "Invoice Number",
      "invoice",
      "Invoice",
      "orderId",
      "order_id",
      "id",
      "ID",
    ], "—")
  );
}


function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  if (!text) return null;

  // DD/MM/YYYY or DD-MM-YYYY
  const indianDate = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (indianDate) {
    const day = Number(indianDate[1]);
    const month = Number(indianDate[2]) - 1;
    const year = Number(indianDate[3]);

    const date = new Date(year, month, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  // YYYY/MM/DD or YYYY-MM-DD
  const isoDate = text.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/
  );

  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]) - 1;
    const day = Number(isoDate[3]);

    const date = new Date(year, month, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(text);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}


function formatCurrency(value) {
  const number = Number(value) || 0;

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}


function formatCurrencyDecimal(value) {
  const number = Number(value) || 0;

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatShortDate(value) {
  const date = parseDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}


function isPaidStatus(status) {
  const value = String(status).toLowerCase();

  return [
    "paid",
    "complete",
    "completed",
    "success",
    "successful",
    "received",
  ].some((item) => value.includes(item));
}


function isPendingStatus(status) {
  const value = String(status).toLowerCase();

  return [
    "pending",
    "unpaid",
    "due",
    "outstanding",
    "partial",
    "unpaid",
  ].some((item) => value.includes(item));
}


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


// =========================================================
// COMPONENT
// =========================================================

function Analytics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productFilter, setProductFilter] = useState("All Products");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);

    const localRows = getStoredData();

    if (localRows.length > 0) {
      setRows(localRows);
      setLoading(false);
      return;
    }

    try {
      const userId = getUserId();

      const response = await fetch(
        `${API_URL}/dashboard?user_id=${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch dashboard data");
      }

      const data = await response.json();

      const backendRows =
        Array.isArray(data?.rows)
          ? data.rows
          : Array.isArray(data?.transactions)
          ? data.transactions
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setRows(backendRows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(
      "pulseiq-data-updated",
      handleUpdate
    );

    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        handleUpdate
      );

      window.removeEventListener("storage", handleUpdate);
    };
  }, []);


  // =========================================================
  // NORMALIZED DATA
  // =========================================================

  const normalizedRows = useMemo(() => {
    return rows.map((row, index) => ({
      ...row,

      _index: index,

      customer: getCustomer(row),

      product: getProduct(row),

      quantity: getQuantity(row),

      amount: getAmount(row),

      payment: getPayment(row),

      date: getDate(row),

      invoice: getInvoice(row),
    }));
  }, [rows]);


  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const products = useMemo(() => {
    return [
      "All Products",
      ...Array.from(
        new Set(
          normalizedRows
            .map((row) => row.product)
            .filter(
              (product) =>
                product &&
                product !== "Unknown Product"
            )
        )
      ).sort(),
    ];
  }, [normalizedRows]);


  // =========================================================
  // FILTERED DATA
  // =========================================================

  const filteredRows = useMemo(() => {
    const now = new Date();

    let startDate = null;

    if (dateFilter === "7 Days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    }

    if (dateFilter === "30 Days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    }

    if (dateFilter === "90 Days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
    }

    return normalizedRows.filter((row) => {
      // Product
      if (
        productFilter !== "All Products" &&
        row.product !== productFilter
      ) {
        return false;
      }

      // Payment
      if (paymentFilter === "Paid" && !isPaidStatus(row.payment)) {
        return false;
      }

      if (
        paymentFilter === "Pending" &&
        !isPendingStatus(row.payment)
      ) {
        return false;
      }

      // Search
      if (search.trim()) {
        const query = search.toLowerCase();

        const searchable = [
          row.customer,
          row.product,
          row.invoice,
          row.payment,
          row.date,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      // Date
      if (startDate) {
        const rowDate = parseDate(row.date);

        if (!rowDate) {
          return false;
        }

        if (rowDate < startDate) {
          return false;
        }
      }

      return true;
    });
  }, [
    normalizedRows,
    productFilter,
    paymentFilter,
    dateFilter,
    search,
  ]);


  // =========================================================
  // CORE STATS
  // =========================================================

  const stats = useMemo(() => {
    const revenue = filteredRows.reduce(
      (sum, row) => sum + row.amount,
      0
    );

    const orders = filteredRows.length;

    const customerSet = new Set(
      filteredRows
        .map((row) => row.customer)
        .filter(
          (customer) =>
            customer &&
            customer !== "Unknown Customer"
        )
    );

    const customers = customerSet.size;

    const paidRows = filteredRows.filter((row) =>
      isPaidStatus(row.payment)
    );

    const pendingRows = filteredRows.filter((row) =>
      isPendingStatus(row.payment)
    );

    const paidAmount = paidRows.reduce(
      (sum, row) => sum + row.amount,
      0
    );

    const pendingAmount = pendingRows.reduce(
      (sum, row) => sum + row.amount,
      0
    );

    const averageOrder =
      orders > 0 ? revenue / orders : 0;

    const totalUnits = filteredRows.reduce(
      (sum, row) => sum + row.quantity,
      0
    );

    const paymentCompletion =
      revenue > 0
        ? (paidAmount / revenue) * 100
        : 0;

    return {
      revenue,
      orders,
      customers,
      paidAmount,
      pendingAmount,
      averageOrder,
      totalUnits,
      paymentCompletion,
    };
  }, [filteredRows]);


  // =========================================================
  // CUSTOMER ANALYSIS
  // =========================================================

  const customerPerformance = useMemo(() => {
    const map = {};

    filteredRows.forEach((row) => {
      if (!map[row.customer]) {
        map[row.customer] = {
          name: row.customer,
          revenue: 0,
          orders: 0,
          units: 0,
        };
      }

      map[row.customer].revenue += row.amount;
      map[row.customer].orders += 1;
      map[row.customer].units += row.quantity;
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredRows]);


  const repeatCustomerRate = useMemo(() => {
    const customerOrders = {};

    filteredRows.forEach((row) => {
      if (
        !row.customer ||
        row.customer === "Unknown Customer"
      ) {
        return;
      }

      customerOrders[row.customer] =
        (customerOrders[row.customer] || 0) + 1;
    });

    const customers = Object.keys(customerOrders);

    if (customers.length === 0) return 0;

    const repeatCustomers = customers.filter(
      (customer) =>
        customerOrders[customer] > 1
    ).length;

    return (repeatCustomers / customers.length) * 100;
  }, [filteredRows]);


  const revenuePerCustomer =
    stats.customers > 0
      ? stats.revenue / stats.customers
      : 0;


  const topCustomer = customerPerformance[0] || null;

  const topCustomerShare =
    topCustomer && stats.revenue > 0
      ? (topCustomer.revenue / stats.revenue) * 100
      : 0;


  // =========================================================
  // PRODUCT ANALYSIS
  // =========================================================

  const productPerformance = useMemo(() => {
    const map = {};

    filteredRows.forEach((row) => {
      if (!map[row.product]) {
        map[row.product] = {
          name: row.product,
          revenue: 0,
          orders: 0,
          units: 0,
        };
      }

      map[row.product].revenue += row.amount;
      map[row.product].orders += 1;
      map[row.product].units += row.quantity;
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredRows]);


  const bestProduct = productPerformance[0] || null;

  const bestProductShare =
    bestProduct && stats.revenue > 0
      ? (bestProduct.revenue / stats.revenue) * 100
      : 0;


  // =========================================================
  // MONTHLY REVENUE
  // =========================================================

  const monthlyRevenue = useMemo(() => {
    const map = {};

    filteredRows.forEach((row) => {
      const date = parseDate(row.date);

      if (!date) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!map[key]) {
        map[key] = {
          key,
          revenue: 0,
          orders: 0,
          date,
        };
      }

      map[key].revenue += row.amount;
      map[key].orders += 1;
    });

    return Object.values(map)
      .sort((a, b) => a.date - b.date)
      .slice(-6);
  }, [filteredRows]);


  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );


  // =========================================================
  // DAY ANALYSIS
  // =========================================================

  const dayPerformance = useMemo(() => {
    const map = {};

    filteredRows.forEach((row) => {
      const date = parseDate(row.date);

      if (!date) return;

      const day = date.toLocaleDateString("en-IN", {
        weekday: "long",
      });

      if (!map[day]) {
        map[day] = {
          day,
          revenue: 0,
          orders: 0,
        };
      }

      map[day].revenue += row.amount;
      map[day].orders += 1;
    });

    return Object.values(map).sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [filteredRows]);


  const bestDay = dayPerformance[0] || null;


  // =========================================================
  // BUSINESS PULSE SCORE
  // =========================================================

  const pulseScore = useMemo(() => {
    const collectionScore = clamp(
      stats.paymentCompletion,
      0,
      100
    );

    const repeatScore = clamp(
      repeatCustomerRate * 2,
      0,
      100
    );

    const diversificationScore = clamp(
      100 - topCustomerShare,
      0,
      100
    );

    const activityScore = clamp(
      stats.orders * 5,
      0,
      100
    );

    const score =
      collectionScore * 0.45 +
      repeatScore * 0.25 +
      diversificationScore * 0.15 +
      activityScore * 0.15;

    return Math.round(clamp(score, 0, 100));
  }, [
    stats,
    repeatCustomerRate,
    topCustomerShare,
  ]);


  const pulseLabel =
    pulseScore >= 80
      ? "Excellent"
      : pulseScore >= 65
      ? "Healthy"
      : pulseScore >= 45
      ? "Needs Attention"
      : "At Risk";


  // =========================================================
  // INSIGHTS
  // =========================================================

  const insights = useMemo(() => {
    const result = [];

    if (stats.pendingAmount > 0) {
      result.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Collection Risk",
        text: `${formatCurrency(
          stats.pendingAmount
        )} is currently pending from your filtered sales.`,
      });
    } else {
      result.push({
        type: "success",
        icon: CheckCircle2,
        title: "Payments Healthy",
        text: "Your current filtered sales show no major pending collection.",
      });
    }


    if (bestProduct) {
      result.push({
        type: "product",
        icon: Crown,
        title: "Revenue Leader",
        text: `${bestProduct.name} contributes ${bestProductShare.toFixed(
          1
        )}% of your filtered revenue.`,
      });
    }


    if (repeatCustomerRate >= 30) {
      result.push({
        type: "customer",
        icon: Users,
        title: "Strong Retention",
        text: `${repeatCustomerRate.toFixed(
          1
        )}% of customers are repeat buyers.`,
      });
    } else {
      result.push({
        type: "customer",
        icon: Users,
        title: "Retention Opportunity",
        text: `Only ${repeatCustomerRate.toFixed(
          1
        )}% of customers have purchased more than once.`,
      });
    }


    if (bestDay) {
      result.push({
        type: "trend",
        icon: TrendingUp,
        title: "Best Sales Day",
        text: `${bestDay.day} is currently your strongest revenue day.`,
      });
    }


    return result.slice(0, 4);
  }, [
    stats.pendingAmount,
    bestProduct,
    bestProductShare,
    repeatCustomerRate,
    bestDay,
  ]);


  // =========================================================
  // RECENT TRANSACTIONS
  // =========================================================

  const recentTransactions = useMemo(() => {
    return [...filteredRows]
      .sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [filteredRows]);


  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (!loading && rows.length === 0) {
    return (
      <div className="dashboard-shell">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="analytics-page">
            <div className="analytics-empty">
              <div className="analytics-empty-icon">
                <BarChart3 size={34} />
              </div>

              <h2>No analytics data yet</h2>

              <p>
                Upload your business data to unlock
                trends, customer behaviour, product
                performance and business insights.
              </p>

              <a href="/upload" className="analytics-empty-button">
                Upload Data
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="analytics-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="analytics-header">
            <div>
              <span className="analytics-eyebrow">
                DECISION WORKSPACE
              </span>

              <h1>Analytics</h1>

              <p>
                Understand what is driving your business,
                where money is getting stuck, and what
                deserves your attention next.
              </p>
            </div>

            <button
              type="button"
              className="analytics-refresh"
              onClick={loadData}
            >
              <RefreshCw
                size={16}
                className={loading ? "spin" : ""}
              />
              Refresh Analysis
            </button>
          </section>


          {/* =================================================
              FILTER BAR
          ================================================= */}

          <section className="analytics-filter-bar">

            <div className="analytics-filter-title">
              <Target size={17} />
              <span>Analysis Controls</span>
            </div>

            <div className="analytics-filter-group">
              <label>Period</label>

              <select
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value)
                }
              >
                <option>All Time</option>
                <option>7 Days</option>
                <option>30 Days</option>
                <option>90 Days</option>
              </select>
            </div>


            <div className="analytics-filter-group">
              <label>Product</label>

              <select
                value={productFilter}
                onChange={(e) =>
                  setProductFilter(e.target.value)
                }
              >
                {products.map((product) => (
                  <option key={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>


            <div className="analytics-filter-group">
              <label>Payment</label>

              <select
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(e.target.value)
                }
              >
                <option>All Payments</option>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>


            <div className="analytics-search">
              <input
                type="text"
                placeholder="Search customer, product..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

          </section>


          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="analytics-stats-grid">

            <div className="analytics-stat-card revenue">
              <div className="analytics-stat-top">
                <span>Revenue</span>

                <div className="analytics-stat-icon">
                  <IndianRupee size={19} />
                </div>
              </div>

              <strong>
                {formatCurrency(stats.revenue)}
              </strong>

              <div className="analytics-stat-meta positive">
                <ArrowUpRight size={14} />
                Total filtered sales
              </div>
            </div>


            <div className="analytics-stat-card orders">
              <div className="analytics-stat-top">
                <span>Orders</span>

                <div className="analytics-stat-icon">
                  <Package size={19} />
                </div>
              </div>

              <strong>
                {stats.orders.toLocaleString("en-IN")}
              </strong>

              <div className="analytics-stat-meta">
                <Activity size={14} />
                {stats.totalUnits.toLocaleString("en-IN")} units sold
              </div>
            </div>


            <div className="analytics-stat-card customers">
              <div className="analytics-stat-top">
                <span>Customers</span>

                <div className="analytics-stat-icon">
                  <Users size={19} />
                </div>
              </div>

              <strong>
                {stats.customers.toLocaleString("en-IN")}
              </strong>

              <div className="analytics-stat-meta">
                <RefreshCw size={14} />
                {repeatCustomerRate.toFixed(1)}% repeat rate
              </div>
            </div>


            <div className="analytics-stat-card aov">
              <div className="analytics-stat-top">
                <span>Avg. Order Value</span>

                <div className="analytics-stat-icon">
                  <Wallet size={19} />
                </div>
              </div>

              <strong>
                {formatCurrencyDecimal(
                  stats.averageOrder
                )}
              </strong>

              <div className="analytics-stat-meta">
                <Zap size={14} />
                Revenue per transaction
              </div>
            </div>

          </section>


          {/* =================================================
              BUSINESS PULSE + QUICK METRICS
          ================================================= */}

          <section className="analytics-workspace-grid">

            <div className="pulse-card">

              <div className="pulse-card-header">
                <div>
                  <span className="section-eyebrow">
                    BUSINESS PULSE
                  </span>

                  <h2>Overall Business Health</h2>

                  <p>
                    A quick signal based on collections,
                    customer retention, diversification
                    and order activity.
                  </p>
                </div>

                <div className="pulse-icon">
                  <Activity size={20} />
                </div>
              </div>


              <div className="pulse-main">

                <div
                  className="pulse-ring"
                  style={{
                    "--pulse-score": `${pulseScore * 3.6}deg`,
                  }}
                >
                  <div className="pulse-ring-inner">
                    <strong>{pulseScore}</strong>
                    <span>/ 100</span>
                  </div>
                </div>

                <div className="pulse-status">
                  <span className="pulse-status-label">
                    {pulseLabel}
                  </span>

                  <h3>
                    {pulseScore >= 65
                      ? "Business momentum looks positive."
                      : "There are areas that need attention."}
                  </h3>

                  <p>
                    Use the insights below to decide
                    what to focus on next.
                  </p>
                </div>

              </div>


              <div className="pulse-metrics">

                <div>
                  <span>Collection</span>
                  <strong>
                    {stats.paymentCompletion.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span>Repeat Customers</span>
                  <strong>
                    {repeatCustomerRate.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span>Revenue / Customer</span>
                  <strong>
                    {formatCurrency(
                      revenuePerCustomer
                    )}
                  </strong>
                </div>

                <div>
                  <span>Pending Risk</span>
                  <strong>
                    {formatCurrency(
                      stats.pendingAmount
                    )}
                  </strong>
                </div>

              </div>

            </div>


            <div className="decision-card">

              <div className="decision-header">
                <div>
                  <span className="section-eyebrow">
                    QUICK DECISIONS
                  </span>

                  <h2>What stands out</h2>
                </div>

                <Zap size={20} />
              </div>


              <div className="decision-list">

                <div className="decision-item">
                  <div className="decision-item-icon">
                    <Crown size={17} />
                  </div>

                  <div>
                    <span>Best Product</span>

                    <strong>
                      {bestProduct
                        ? bestProduct.name
                        : "—"}
                    </strong>
                  </div>
                </div>


                <div className="decision-item">
                  <div className="decision-item-icon">
                    <Users size={17} />
                  </div>

                  <div>
                    <span>Top Customer</span>

                    <strong>
                      {topCustomer
                        ? topCustomer.name
                        : "—"}
                    </strong>
                  </div>
                </div>


                <div className="decision-item">
                  <div className="decision-item-icon">
                    <TrendingUp size={17} />
                  </div>

                  <div>
                    <span>Best Sales Day</span>

                    <strong>
                      {bestDay
                        ? bestDay.day
                        : "—"}
                    </strong>
                  </div>
                </div>


                <div className="decision-item">
                  <div className="decision-item-icon warning">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <span>Pending Revenue</span>

                    <strong>
                      {formatCurrency(
                        stats.pendingAmount
                      )}
                    </strong>
                  </div>
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              AUTO INSIGHTS
          ================================================= */}

          <section className="analytics-insights-section">

            <div className="analytics-section-heading">
              <div>
                <span className="section-eyebrow">
                  AUTOMATED ANALYSIS
                </span>

                <h2>Business Insights</h2>
              </div>

              <span className="insight-count">
                {insights.length} observations
              </span>
            </div>


            <div className="insight-grid">

              {insights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`insight-card ${item.type}`}
                    key={`${item.title}-${index}`}
                  >
                    <div className="insight-icon">
                      <Icon size={18} />
                    </div>

                    <div>
                      <span>{item.title}</span>
                      <p>{item.text}</p>
                    </div>
                  </div>
                );
              })}

            </div>

          </section>


          {/* =================================================
              REVENUE TREND
          ================================================= */}

          <section className="analytics-section-card">

            <div className="analytics-section-heading">
              <div>
                <span className="section-eyebrow">
                  REVENUE MOMENTUM
                </span>

                <h2>Revenue Trend</h2>

                <p>
                  See how revenue is moving across
                  recent months.
                </p>
              </div>

              <div className="trend-total">
                <span>Total</span>
                <strong>
                  {formatCurrency(stats.revenue)}
                </strong>
              </div>
            </div>


            {monthlyRevenue.length > 0 ? (
              <div className="revenue-chart">

                <div className="revenue-y-axis">
                  <span>High</span>
                  <span>Medium</span>
                  <span>Low</span>
                </div>

                <div className="revenue-bars">

                  {monthlyRevenue.map((item) => {
                    const height =
                      (item.revenue /
                        maxMonthlyRevenue) *
                      100;

                    return (
                      <div
                        className="revenue-bar-column"
                        key={item.key}
                      >
                        <div className="revenue-bar-value">
                          {formatCurrency(item.revenue)}
                        </div>

                        <div className="revenue-bar-track">
                          <div
                            className="revenue-bar-fill"
                            style={{
                              height: `${Math.max(
                                height,
                                4
                              )}%`,
                            }}
                          />
                        </div>

                        <span>
                          {item.date.toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                            }
                          )}
                        </span>
                      </div>
                    );
                  })}

                </div>

              </div>
            ) : (
              <div className="analytics-chart-empty">
                Date information is not available for
                the selected data.
              </div>
            )}

          </section>


          {/* =================================================
              PRODUCT + CUSTOMER
          ================================================= */}

          <section className="analytics-two-column">

            {/* PRODUCT */}

            <div className="analytics-section-card">

              <div className="analytics-section-heading compact">
                <div>
                  <span className="section-eyebrow">
                    PRODUCT INTELLIGENCE
                  </span>

                  <h2>Product Performance</h2>

                  <p>
                    Which products are actually driving
                    your revenue.
                  </p>
                </div>

                <Package size={20} />
              </div>


              <div className="performance-list">

                {productPerformance.length > 0 ? (
                  productPerformance.map(
                    (product, index) => {
                      const percentage =
                        stats.revenue > 0
                          ? (product.revenue /
                              stats.revenue) *
                            100
                          : 0;

                      return (
                        <div
                          className="performance-row"
                          key={product.name}
                        >
                          <div className="performance-rank">
                            {index + 1}
                          </div>

                          <div className="performance-info">
                            <div className="performance-title">
                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                {formatCurrency(
                                  product.revenue
                                )}
                              </span>
                            </div>

                            <div className="performance-meta">
                              {product.orders} orders
                              {" • "}
                              {product.units} units
                            </div>

                            <div className="performance-progress">
                              <span
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="no-data">
                    No product data available.
                  </div>
                )}

              </div>

            </div>


            {/* CUSTOMER */}

            <div className="analytics-section-card">

              <div className="analytics-section-heading compact">
                <div>
                  <span className="section-eyebrow">
                    CUSTOMER INTELLIGENCE
                  </span>

                  <h2>Top Customers</h2>

                  <p>
                    Customers contributing the most
                    revenue.
                  </p>
                </div>

                <Users size={20} />
              </div>


              <div className="customer-list">

                {customerPerformance.length > 0 ? (
                  customerPerformance
                    .slice(0, 6)
                    .map((customer, index) => (
                      <div
                        className="customer-row"
                        key={customer.name}
                      >
                        <div className="customer-avatar">
                          {customer.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="customer-info">
                          <strong>
                            {customer.name}
                          </strong>

                          <span>
                            {customer.orders}{" "}
                            {customer.orders === 1
                              ? "order"
                              : "orders"}
                          </span>
                        </div>

                        <strong className="customer-revenue">
                          {formatCurrency(
                            customer.revenue
                          )}
                        </strong>
                      </div>
                    ))
                ) : (
                  <div className="no-data">
                    No customer data available.
                  </div>
                )}

              </div>

            </div>

          </section>


          {/* =================================================
              CUSTOMER VALUE + PAYMENT HEALTH
          ================================================= */}

          <section className="analytics-value-grid">

            <div className="value-card">

              <div className="value-card-icon">
                <Users size={20} />
              </div>

              <div>
                <span>Customer Value</span>

                <strong>
                  {formatCurrency(
                    revenuePerCustomer
                  )}
                </strong>

                <small>
                  Average revenue generated per
                  known customer
                </small>
              </div>

            </div>


            <div className="value-card">

              <div className="value-card-icon">
                <RefreshCw size={20} />
              </div>

              <div>
                <span>Repeat Rate</span>

                <strong>
                  {repeatCustomerRate.toFixed(1)}%
                </strong>

                <small>
                  Customers who purchased more than
                  once
                </small>
              </div>

            </div>


            <div className="value-card">

              <div className="value-card-icon">
                <Crown size={20} />
              </div>

              <div>
                <span>Top Customer Share</span>

                <strong>
                  {topCustomerShare.toFixed(1)}%
                </strong>

                <small>
                  Revenue generated by your top
                  customer
                </small>
              </div>

            </div>


            <div className="payment-card">

              <div className="payment-card-header">
                <div>
                  <span>Payment Health</span>

                  <strong>
                    {stats.paymentCompletion.toFixed(1)}%
                  </strong>
                </div>

                <Wallet size={20} />
              </div>

              <div className="payment-progress">
                <span
                  style={{
                    width: `${Math.min(
                      stats.paymentCompletion,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="payment-breakdown">
                <div>
                  <span>Collected</span>
                  <strong>
                    {formatCurrency(
                      stats.paidAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Pending</span>
                  <strong>
                    {formatCurrency(
                      stats.pendingAmount
                    )}
                  </strong>
                </div>
              </div>

            </div>

          </section>


          {/* =================================================
              REVENUE MIX
          ================================================= */}

          <section className="analytics-section-card">

            <div className="analytics-section-heading">
              <div>
                <span className="section-eyebrow">
                  REVENUE MIX
                </span>

                <h2>Where Your Revenue Comes From</h2>

                <p>
                  Revenue concentration across your
                  strongest products.
                </p>
              </div>

              <BarChart3 size={20} />
            </div>


            <div className="revenue-mix">

              {productPerformance.length > 0 ? (
                productPerformance
                  .slice(0, 5)
                  .map((product) => {
                    const percentage =
                      stats.revenue > 0
                        ? (product.revenue /
                            stats.revenue) *
                          100
                        : 0;

                    return (
                      <div
                        className="mix-row"
                        key={product.name}
                      >
                        <div className="mix-label">
                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="mix-track">
                          <span
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mix-amount">
                          {formatCurrency(
                            product.revenue
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-data">
                  No revenue mix available.
                </div>
              )}

            </div>

          </section>


          {/* =================================================
              RECENT TRANSACTIONS
          ================================================= */}

          <section className="analytics-section-card">

            <div className="analytics-section-heading">
              <div>
                <span className="section-eyebrow">
                  ACTIVITY
                </span>

                <h2>Recent Transactions</h2>

                <p>
                  Latest transactions from your current
                  analysis.
                </p>
              </div>

              <span className="transaction-count">
                {filteredRows.length} records
              </span>
            </div>


            <div className="analytics-table-wrapper">

              <table className="analytics-table">

                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>

                  {recentTransactions.length > 0 ? (
                    recentTransactions.map(
                      (row, index) => (
                        <tr
                          key={`${row.invoice}-${index}`}
                        >
                          <td>
                            <span className="invoice-id">
                              {row.invoice}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {row.customer}
                            </strong>
                          </td>

                          <td>
                            {row.product}
                          </td>

                          <td>
                            {formatDate(row.date)}
                          </td>

                          <td>
                            <span
                              className={`payment-badge ${
                                isPaidStatus(
                                  row.payment
                                )
                                  ? "paid"
                                  : "pending"
                              }`}
                            >
                              {isPaidStatus(
                                row.payment
                              )
                                ? "Paid"
                                : "Pending"}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {formatCurrencyDecimal(
                                row.amount
                              )}
                            </strong>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="table-empty"
                      >
                        No transactions match the
                        current filters.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <div className="analytics-footer-note">
            <Activity size={15} />

            <span>
              Analytics updates automatically whenever
              your PulseIQ business data changes.
            </span>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Analytics;