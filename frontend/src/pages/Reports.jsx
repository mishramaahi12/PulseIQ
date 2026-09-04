import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  IndianRupee,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./reports.css";

function Reports() {
  /* =========================================================
     DATA
  ========================================================= */

  const [data, setData] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    source: "demo",
  });

  const [businessRows, setBusinessRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     REPORT BUILDER
  ========================================================= */

  const [reportType, setReportType] = useState("sales");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [generated, setGenerated] = useState(false);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadReportData();

    const handleDataUpdate = () => {
      loadReportData();
    };

    window.addEventListener(
      "pulseiq-data-updated",
      handleDataUpdate
    );

    window.addEventListener(
      "storage",
      handleDataUpdate
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        handleDataUpdate
      );

      window.removeEventListener(
        "storage",
        handleDataUpdate
      );
    };
  }, []);

  const loadReportData = async () => {
    setLoading(true);

    try {
      const savedData = localStorage.getItem(
        "pulseiq_business_data"
      );

      if (savedData) {
        const rows = JSON.parse(savedData);

        if (Array.isArray(rows) && rows.length > 0) {
          setBusinessRows(rows);

          const revenue = rows.reduce(
            (sum, row) =>
              sum + (Number(row?.totalAmount) || 0),
            0
          );

          const customers = new Set(
            rows
              .map((row) =>
                String(
                  row?.customerName || ""
                ).trim()
              )
              .filter(Boolean)
          ).size;

          setData({
            revenue,
            orders: rows.length,
            customers,
            source: "actual",
          });

          setLoading(false);
          return;
        }
      }

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard"
      );

      const result = await response.json();

      if (result?.source === "actual") {
        setData({
          revenue: Number(result.revenue || 0),
          orders: Number(result.orders || 0),
          customers: Number(
            result.customers || 0
          ),
          source: "actual",
        });
      }
    } catch (error) {
      console.error(
        "Reports data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getAmount = (row) => {
    return (
      Number(
        String(
          row?.totalAmount ??
            row?.amount ??
            row?.total ??
            0
        )
          .replace(/₹/g, "")
          .replace(/Rs\./gi, "")
          .replace(/,/g, "")
          .trim()
      ) || 0
    );
  };

  const getDate = (row) => {
    return (
      row?.purchaseDate ||
      row?.purchase_date ||
      row?.date ||
      row?.orderDate ||
      row?.created_at ||
      row?.createdAt ||
      ""
    );
  };

  const getCustomer = (row) => {
    return (
      String(
        row?.customerName ||
          row?.customer ||
          row?.customer_name ||
          "Unknown Customer"
      ).trim() || "Unknown Customer"
    );
  };

  const getProduct = (row) => {
    return (
      String(
        row?.product ||
          row?.productName ||
          row?.item ||
          row?.description ||
          "Unknown Product"
      ).trim() || "Unknown Product"
    );
  };

  const getQuantity = (row) => {
    return Number(
      row?.quantity ??
        row?.qty ??
        1
    ) || 1;
  };

  const getPaymentStatus = (row) => {
    const status = String(
      row?.paymentStatus ||
        row?.payment_status ||
        row?.status ||
        ""
    ).toLowerCase();

    return status === "pending"
      ? "pending"
      : "paid";
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)}Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)}L`;
    }

    if (amount >= 1000) {
      return `₹${(
        amount / 1000
      ).toFixed(1)}K`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  const formatFullCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* =========================================================
     PERIOD FILTER
  ========================================================= */

  const filteredRows = useMemo(() => {
    if (!businessRows.length) {
      return [];
    }

    if (selectedPeriod === "all") {
      return businessRows;
    }

    const now = new Date();

    const days =
      selectedPeriod === "7days"
        ? 7
        : selectedPeriod === "30days"
        ? 30
        : 90;

    const startDate = new Date(now);

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    startDate.setDate(
      startDate.getDate() - days
    );

    return businessRows.filter(
      (row) => {
        const dateValue = getDate(row);

        if (!dateValue) {
          return false;
        }

        const rowDate = new Date(
          dateValue
        );

        return (
          !Number.isNaN(
            rowDate.getTime()
          ) &&
          rowDate >= startDate
        );
      }
    );
  }, [
    businessRows,
    selectedPeriod,
  ]);

  /* =========================================================
     REPORT STATS
  ========================================================= */

  const reportStats = useMemo(() => {
    const rows =
      businessRows.length > 0
        ? filteredRows
        : [];

    if (!rows.length) {
      return {
        revenue: data.revenue,
        orders: data.orders,
        customers: data.customers,
        paid: 0,
        pending: 0,
        pendingCount: 0,
        paidCount: 0,
      };
    }

    let revenue = 0;
    let paid = 0;
    let pending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    rows.forEach((row) => {
      const amount =
        getAmount(row);

      revenue += amount;

      if (
        getPaymentStatus(row) ===
        "pending"
      ) {
        pending += amount;
        pendingCount += 1;
      } else {
        paid += amount;
        paidCount += 1;
      }
    });

    const customers = new Set(
      rows
        .map(getCustomer)
        .filter(Boolean)
    ).size;

    return {
      revenue,
      orders: rows.length,
      customers,
      paid,
      pending,
      pendingCount,
      paidCount,
    };
  }, [
    businessRows,
    filteredRows,
    data,
  ]);

  /* =========================================================
     PAYMENT RATE
  ========================================================= */

  const collectionRate =
    reportStats.revenue > 0
      ? (
          (reportStats.paid /
            reportStats.revenue) *
          100
        ).toFixed(1)
      : "0.0";

  /* =========================================================
     PRODUCT REPORT
  ========================================================= */

  const productReport = useMemo(() => {
    const map = new Map();

    filteredRows.forEach((row) => {
      const product =
        getProduct(row);

      const amount =
        getAmount(row);

      const quantity =
        getQuantity(row);

      if (!map.has(product)) {
        map.set(product, {
          name: product,
          units: 0,
          revenue: 0,
        });
      }

      const item =
        map.get(product);

      item.units += quantity;
      item.revenue += amount;
    });

    return Array.from(
      map.values()
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 5);
  }, [filteredRows]);

  /* =========================================================
     CUSTOMER REPORT
  ========================================================= */

  const customerReport = useMemo(() => {
    const map = new Map();

    filteredRows.forEach((row) => {
      const customer =
        getCustomer(row);

      const amount =
        getAmount(row);

      if (!map.has(customer)) {
        map.set(customer, {
          name: customer,
          revenue: 0,
          orders: 0,
        });
      }

      const item =
        map.get(customer);

      item.revenue += amount;
      item.orders += 1;
    });

    return Array.from(
      map.values()
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 5);
  }, [filteredRows]);

  /* =========================================================
     REPORT TYPE DATA
  ========================================================= */

  const reportTypeInfo = {
    sales: {
      title: "Sales Report",
      description:
        "Review order volume and sales activity.",
      icon: BarChart3,
    },

    revenue: {
      title: "Revenue Report",
      description:
        "Review business revenue and collections.",
      icon: IndianRupee,
    },

    customers: {
      title: "Customer Report",
      description:
        "Review your highest-value customers.",
      icon: Users,
    },

    products: {
      title: "Product Report",
      description:
        "Review products generating the most revenue.",
      icon: Package,
    },

    payments: {
      title: "Payment Report",
      description:
        "Review paid and outstanding payments.",
      icon: WalletCards,
    },
  };

  const activeReport =
    reportTypeInfo[reportType];

  const ActiveReportIcon =
    activeReport.icon;

  /* =========================================================
     GENERATE
  ========================================================= */

  const generateReport = () => {
    setGenerated(true);

    setTimeout(() => {
      document
        .querySelector(
          ".report-results"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  };

  /* =========================================================
     PRINT / PDF
  ========================================================= */

  const downloadPDF = () => {
    window.print();
  };

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const exportCSV = () => {
    if (!filteredRows.length) {
      return;
    }

    const headers = [
      "Customer",
      "Product",
      "Quantity",
      "Amount",
      "Payment Status",
      "Date",
    ];

    const csvRows = filteredRows.map(
      (row) => [
        getCustomer(row),
        getProduct(row),
        getQuantity(row),
        getAmount(row),
        getPaymentStatus(row),
        getDate(row),
      ]
    );

    const csv = [
      headers,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(
              value ?? ""
            ).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `PulseIQ_${activeReport.title.replace(
        /\s+/g,
        "_"
      )}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     PERIOD LABEL
  ========================================================= */

  const periodLabel =
    selectedPeriod === "all"
      ? "All Time"
      : selectedPeriod === "7days"
      ? "Last 7 Days"
      : selectedPeriod === "30days"
      ? "Last 30 Days"
      : "Last 90 Days";

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="dashboard-shell reports-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content reports-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="reports-header">
            <div className="reports-header-content">

              <div className="reports-eyebrow">
                REPORT CENTER
              </div>

              <h1 className="reports-title">
                Business Reports
              </h1>

              <p className="reports-description">
                Build, review and export
                professional reports from
                your PulseIQ business data.
              </p>

            </div>

            <div className="reports-header-actions">

              <button
                type="button"
                className="reports-refresh-button"
                onClick={
                  loadReportData
                }
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "reports-spin"
                      : ""
                  }
                />

                Refresh
              </button>

            </div>
          </section>

          {/* =================================================
              REPORT BUILDER
          ================================================= */}

          <section className="report-builder">

            <div className="report-builder-heading">

              <div className="builder-icon">
                <FileText size={21} />
              </div>

              <div>
                <span>
                  REPORT BUILDER
                </span>

                <h2>
                  Build a Business Report
                </h2>

                <p>
                  Select the report you want
                  to review and choose a
                  reporting period.
                </p>
              </div>

            </div>

            {/* REPORT TYPES */}

            <div className="report-type-grid">

              {Object.entries(
                reportTypeInfo
              ).map(
                ([
                  id,
                  item,
                ]) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={id}
                      className={`report-type-option ${
                        reportType === id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setReportType(id);
                        setGenerated(false);
                      }}
                    >

                      <span className="report-type-icon">
                        <Icon size={18} />
                      </span>

                      <span className="report-type-text">
                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.description}
                        </small>
                      </span>

                      {reportType ===
                        id && (
                        <CheckCircle2
                          size={17}
                          className="report-type-check"
                        />
                      )}

                    </button>
                  );
                }
              )}

            </div>

            {/* PERIOD */}

            <div className="builder-bottom">

              <div className="builder-period">

                <div className="builder-period-label">
                  <CalendarDays
                    size={16}
                  />

                  <span>
                    Reporting Period
                  </span>
                </div>

                <div className="builder-period-buttons">

                  {[
                    [
                      "all",
                      "All Time",
                    ],
                    [
                      "7days",
                      "7 Days",
                    ],
                    [
                      "30days",
                      "30 Days",
                    ],
                    [
                      "90days",
                      "90 Days",
                    ],
                  ].map(
                    ([
                      id,
                      label,
                    ]) => (
                      <button
                        type="button"
                        key={id}
                        className={
                          selectedPeriod ===
                          id
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          setSelectedPeriod(
                            id
                          );
                          setGenerated(
                            false
                          );
                        }}
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>

              </div>

              <button
                type="button"
                className="generate-report-button"
                onClick={
                  generateReport
                }
              >
                <FileText size={17} />

                Generate Report
              </button>

            </div>

          </section>

          {/* =================================================
              GENERATED REPORT
          ================================================= */}

          <section
            className={`report-results ${
              generated
                ? "report-results-generated"
                : ""
            }`}
          >

            {/* RESULT HEADER */}

            <div className="report-results-header">

              <div>

                <span className="results-eyebrow">
                  GENERATED REPORT
                </span>

                <h2>
                  {activeReport.title}
                </h2>

                <p>
                  {activeReport.description}{" "}
                  <strong>
                    {periodLabel}
                  </strong>
                </p>

              </div>

              <div className="report-result-actions">

                <button
                  type="button"
                  className="report-export-csv"
                  onClick={
                    exportCSV
                  }
                  disabled={
                    !filteredRows.length
                  }
                >
                  <Download
                    size={15}
                  />

                  Export CSV
                </button>

                <button
                  type="button"
                  className="report-export-pdf"
                  onClick={
                    downloadPDF
                  }
                >
                  <Download
                    size={15}
                  />

                  Download PDF
                </button>

              </div>

            </div>

            {/* =================================================
                EXECUTIVE SUMMARY
            ================================================= */}

            <div className="executive-summary">

              <div className="executive-summary-header">

                <div>
                  <span>
                    EXECUTIVE SUMMARY
                  </span>

                  <h3>
                    Business Performance
                  </h3>
                </div>

                <ActiveReportIcon
                  size={21}
                />

              </div>

              <div className="summary-grid">

                <div className="summary-item blue-summary">
                  <span>
                    TOTAL REVENUE
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : formatFullCurrency(
                          reportStats.revenue
                        )}
                  </strong>

                  <small>
                    Revenue generated
                  </small>
                </div>

                <div className="summary-item green-summary">
                  <span>
                    ORDERS
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : reportStats.orders.toLocaleString()}
                  </strong>

                  <small>
                    Orders recorded
                  </small>
                </div>

                <div className="summary-item purple-summary">
                  <span>
                    CUSTOMERS
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : reportStats.customers.toLocaleString()}
                  </strong>

                  <small>
                    Unique customers
                  </small>
                </div>

                <div className="summary-item orange-summary">
                  <span>
                    COLLECTION RATE
                  </span>

                  <strong>
                    {collectionRate}%
                  </strong>

                  <small>
                    Revenue collected
                  </small>
                </div>

              </div>

            </div>

            {/* =================================================
                HIGHLIGHTS
            ================================================= */}

            <div className="report-highlights">

              <div className="report-section-title">

                <div>
                  <span>
                    KEY HIGHLIGHTS
                  </span>

                  <h3>
                    What needs your attention
                  </h3>
                </div>

              </div>

              <div className="highlight-grid">

                <div className="highlight-card highlight-best">

                  <div className="highlight-icon">
                    <TrendingUp
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      BEST PRODUCT
                    </span>

                    <strong>
                      {productReport[0]
                        ?.name ||
                        "No data available"}
                    </strong>

                    <small>
                      {productReport[0]
                        ? `${formatCurrency(
                            productReport[0]
                              .revenue
                          )} revenue`
                        : "Upload data to calculate"}
                    </small>
                  </div>

                </div>

                <div className="highlight-card highlight-customer">

                  <div className="highlight-icon">
                    <Users
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      TOP CUSTOMER
                    </span>

                    <strong>
                      {customerReport[0]
                        ?.name ||
                        "No data available"}
                    </strong>

                    <small>
                      {customerReport[0]
                        ? `${formatCurrency(
                            customerReport[0]
                              .revenue
                          )} total value`
                        : "Upload data to calculate"}
                    </small>
                  </div>

                </div>

                <div className="highlight-card highlight-pending">

                  <div className="highlight-icon">
                    <TrendingDown
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      OUTSTANDING
                    </span>

                    <strong>
                      {formatCurrency(
                        reportStats.pending
                      )}
                    </strong>

                    <small>
                      {
                        reportStats.pendingCount
                      } pending payments
                    </small>
                  </div>

                </div>

                <div className="highlight-card highlight-orders">

                  <div className="highlight-icon">
                    <BarChart3
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      SALES VOLUME
                    </span>

                    <strong>
                      {reportStats.orders.toLocaleString()}
                    </strong>

                    <small>
                      Total transactions
                    </small>
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                REPORT CONTENT
            ================================================= */}

            <div className="report-content-grid">

              {/* PRODUCT / CUSTOMER */}

              <div className="report-data-card">

                <div className="report-data-heading">

                  <div>
                    <span>
                      {reportType ===
                      "customers"
                        ? "CUSTOMER REPORT"
                        : "PRODUCT REPORT"}
                    </span>

                    <h3>
                      {reportType ===
                      "customers"
                        ? "Top Customers"
                        : "Top Performing Products"}
                    </h3>
                  </div>

                  {reportType ===
                  "customers" ? (
                    <Users
                      size={19}
                    />
                  ) : (
                    <Package
                      size={19}
                    />
                  )}

                </div>

                {reportType ===
                "customers" ? (
                  customerReport.length >
                  0 ? (
                    <div className="report-list">

                      {customerReport.map(
                        (
                          customer,
                          index
                        ) => (
                          <div
                            className="report-list-row"
                            key={
                              customer.name
                            }
                          >

                            <div className="report-list-number">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div className="report-list-info">
                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <small>
                                {
                                  customer.orders
                                }{" "}
                                orders
                              </small>
                            </div>

                            <strong className="report-list-value">
                              {formatCurrency(
                                customer.revenue
                              )}
                            </strong>

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <NoReportData />
                  )
                ) : productReport.length >
                  0 ? (
                  <div className="report-list">

                    {productReport.map(
                      (
                        product,
                        index
                      ) => (
                        <div
                          className="report-list-row"
                          key={
                            product.name
                          }
                        >

                          <div className="report-list-number">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="report-list-info">
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <small>
                              {
                                product.units
                              }{" "}
                              units sold
                            </small>
                          </div>

                          <strong className="report-list-value">
                            {formatCurrency(
                              product.revenue
                            )}
                          </strong>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <NoReportData />
                )}

              </div>

              {/* PAYMENT */}

              <div className="report-data-card">

                <div className="report-data-heading">

                  <div>
                    <span>
                      PAYMENT REPORT
                    </span>

                    <h3>
                      Collection Overview
                    </h3>
                  </div>

                  <WalletCards
                    size={19}
                  />

                </div>

                <div className="payment-report-overview">

                  <div className="payment-report-item paid">

                    <div>
                      <span>
                        PAID
                      </span>

                      <strong>
                        {formatFullCurrency(
                          reportStats.paid
                        )}
                      </strong>
                    </div>

                    <b>
                      {
                        reportStats.paidCount
                      }
                    </b>

                  </div>

                  <div className="payment-report-item pending">

                    <div>
                      <span>
                        PENDING
                      </span>

                      <strong>
                        {formatFullCurrency(
                          reportStats.pending
                        )}
                      </strong>
                    </div>

                    <b>
                      {
                        reportStats.pendingCount
                      }
                    </b>

                  </div>

                </div>

                <div className="collection-meter">

                  <div className="collection-meter-label">
                    <span>
                      Collection Rate
                    </span>

                    <strong>
                      {collectionRate}%
                    </strong>
                  </div>

                  <div className="collection-track">
                    <div
                      className="collection-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            collectionRate
                          )
                        )}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                REPORT TABLE
            ================================================= */}

            <div className="report-table-card">

              <div className="report-data-heading">

                <div>
                  <span>
                    REPORT RECORDS
                  </span>

                  <h3>
                    Transaction Details
                  </h3>
                </div>

                <span className="record-count">
                  {filteredRows.length} records
                </span>

              </div>

              {filteredRows.length >
              0 ? (
                <div className="report-table-wrapper">

                  <table className="report-table">

                    <thead>
                      <tr>
                        <th>
                          #
                        </th>

                        <th>
                          CUSTOMER
                        </th>

                        <th>
                          PRODUCT
                        </th>

                        <th>
                          DATE
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          STATUS
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredRows
                        .slice(0, 10)
                        .map(
                          (
                            row,
                            index
                          ) => (
                            <tr
                              key={
                                row?.id ??
                                `${getCustomer(
                                  row
                                )}-${index}`
                              }
                            >

                              <td>
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </td>

                              <td>
                                <strong>
                                  {getCustomer(
                                    row
                                  )}
                                </strong>
                              </td>

                              <td>
                                {getProduct(
                                  row
                                )}
                              </td>

                              <td>
                                {getDate(
                                  row
                                ) || "-"}
                              </td>

                              <td className="table-amount">
                                {formatFullCurrency(
                                  getAmount(
                                    row
                                  )
                                )}
                              </td>

                              <td>
                                <span
                                  className={`payment-badge ${
                                    getPaymentStatus(
                                      row
                                    )
                                  }`}
                                >
                                  {getPaymentStatus(
                                    row
                                  ) ===
                                  "paid"
                                    ? "Paid"
                                    : "Pending"}
                                </span>
                              </td>

                            </tr>
                          )
                        )}

                    </tbody>

                  </table>

                </div>
              ) : (
                <NoReportData />
              )}

              {filteredRows.length >
                10 && (
                <div className="table-footer">
                  Showing first 10 records of{" "}
                  {filteredRows.length}.
                  Export CSV for the complete report.
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="report-source-footer">

            <span>
              ●{" "}
              {data.source ===
              "actual"
                ? "Report generated from your uploaded business data."
                : "Report is using available dashboard data."}
            </span>

            <span>
              PulseIQ Business Intelligence
            </span>

          </div>

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   NO DATA COMPONENT
========================================================= */

function NoReportData() {
  return (
    <div className="report-no-data">
      <FileText size={28} />

      <strong>
        No report data available
      </strong>

      <span>
        Upload business data to
        generate this report.
      </span>
    </div>
  );
}

export default Reports;