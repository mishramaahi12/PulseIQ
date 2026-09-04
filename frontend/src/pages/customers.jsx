import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Database,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  CreditCard,
  Clock3,
  TrendingUp,
  SlidersHorizontal,
  Check,
  CalendarDays,
  X,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";
import "./customers.css";

const CUSTOMERS_PER_PAGE = 50;

function Customers() {
  const [businessRows, setBusinessRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Date filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [dateError, setDateError] = useState("");

  const getNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const cleaned = String(value)
      .replace(/₹/g, "")
      .replace(/,/g, "")
      .replace(/%/g, "")
      .trim();

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : 0;
  };

  const getCustomerName = (row) => {
    const value =
      row.customerName ??
      row["Customer Name"] ??
      row.customer ??
      row.Customer ??
      row.customer_name ??
      row.name ??
      row.Name;

    return String(value || "").trim();
  };

  const getDateValue = (row) => {
    return (
      row.purchaseDate ??
      row["Purchase Date"] ??
      row.date ??
      row.Date ??
      row.purchase_date ??
      row.created_at ??
      row.createdAt ??
      ""
    );
  };

  const getAmount = (row) => {
    return getNumber(
      row.totalAmount ??
        row.total_amount ??
        row.total ??
        row.Total ??
        row.revenue ??
        row.Revenue ??
        row.amount ??
        row.Amount ??
        0
    );
  };

  const getPaidAmount = (row) => {
    const directPaid =
      row.paidAmount ??
      row.paid_amount ??
      row.paid ??
      row.Paid ??
      row.amountPaid ??
      row.amount_paid;

    if (
      directPaid !== undefined &&
      directPaid !== null &&
      directPaid !== ""
    ) {
      return getNumber(directPaid);
    }

    const status = String(
      row.paymentStatus ??
        row["Payment Status"] ??
        row.payment_status ??
        row.status ??
        ""
    )
      .trim()
      .toLowerCase();

    if (
      status === "paid" ||
      status === "complete" ||
      status === "completed"
    ) {
      return getAmount(row);
    }

    return 0;
  };

  const getPendingAmount = (row) => {
    const directPending =
      row.pendingAmount ??
      row.pending_amount ??
      row.balanceDue ??
      row.balance_due;

    if (
      directPending !== undefined &&
      directPending !== null &&
      directPending !== ""
    ) {
      return Math.max(0, getNumber(directPending));
    }

    return Math.max(0, getAmount(row) - getPaidAmount(row));
  };

  const getPaymentStatus = (row) => {
    const status = String(
      row.paymentStatus ??
        row["Payment Status"] ??
        row.payment_status ??
        row.status ??
        ""
    )
      .trim()
      .toLowerCase();

    if (
      status === "paid" ||
      status === "complete" ||
      status === "completed"
    ) {
      return "paid";
    }

    if (
      status === "pending" ||
      status === "unpaid" ||
      status === "due" ||
      status === "partial"
    ) {
      return "pending";
    }

    return getPendingAmount(row) > 0 ? "pending" : "paid";
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  };

  const loadCustomers = useCallback(() => {
    setLoading(true);

    try {
      const stored = localStorage.getItem("pulseiq_business_data");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setBusinessRows(parsed);
        } else {
          setBusinessRows([]);
        }
      } else {
        setBusinessRows([]);
      }
    } catch (error) {
      console.error("Failed to load customer data:", error);
      setBusinessRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();

    const handleDataUpdate = () => {
      loadCustomers();
    };

    window.addEventListener(
      "pulseiq-data-updated",
      handleDataUpdate
    );

    window.addEventListener("storage", handleDataUpdate);

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        handleDataUpdate
      );

      window.removeEventListener("storage", handleDataUpdate);
    };
  }, [loadCustomers]);

  // ---------------------------------------------------------
  // DATE FILTER
  // ---------------------------------------------------------

  const applyDateFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("From Date cannot be later than To Date.");
      return;
    }

    setDateError("");

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);

    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setDateError("");
    setCurrentPage(1);
  };

  // ---------------------------------------------------------
  // FILTER RAW TRANSACTIONS FIRST
  // ---------------------------------------------------------

  const dateFilteredRows = useMemo(() => {
    return businessRows.filter((row) => {
      const rawDate = getDateValue(row);

      // Preserve old behavior if a row has no date
      if (!rawDate) {
        return !appliedFromDate && !appliedToDate;
      }

      const rowDate = normalizeDate(rawDate);

      if (!rowDate) {
        return false;
      }

      if (appliedFromDate && rowDate < appliedFromDate) {
        return false;
      }

      if (appliedToDate && rowDate > appliedToDate) {
        return false;
      }

      return true;
    });
  }, [businessRows, appliedFromDate, appliedToDate]);

  // ---------------------------------------------------------
  // GROUP TRANSACTIONS BY CUSTOMER
  // ---------------------------------------------------------

  const customers = useMemo(() => {
    const grouped = {};

    dateFilteredRows.forEach((row) => {
      const name = getCustomerName(row);

      if (!name) return;

      const key = name.toLowerCase();

      if (!grouped[key]) {
        grouped[key] = {
          name,
          purchases: [],
          totalSpent: 0,
          totalPaid: 0,
          totalPending: 0,
          purchaseCount: 0,
          hasPending: false,
          lastPurchase: null,
        };
      }

      const amount = getAmount(row);
      const paid = getPaidAmount(row);
      const pending = getPendingAmount(row);
      const status = getPaymentStatus(row);
      const purchaseDate = getDateValue(row);

      grouped[key].purchases.push({
        ...row,
        amount,
        paid,
        pending,
        status,
        purchaseDate,
      });

      grouped[key].totalSpent += amount;
      grouped[key].totalPaid += paid;
      grouped[key].totalPending += pending;
      grouped[key].purchaseCount += 1;

      if (pending > 0 || status === "pending") {
        grouped[key].hasPending = true;
      }

      if (purchaseDate) {
        const currentDate = new Date(purchaseDate);

        if (
          !Number.isNaN(currentDate.getTime()) &&
          (!grouped[key].lastPurchase ||
            currentDate >
              new Date(grouped[key].lastPurchase))
        ) {
          grouped[key].lastPurchase = purchaseDate;
        }
      }
    });

    return Object.values(grouped);
  }, [dateFilteredRows]);

  // ---------------------------------------------------------
  // SEARCH + SMART FILTER
  // ---------------------------------------------------------

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((customer) =>
        customer.name.toLowerCase().includes(searchValue)
      );
    }

    switch (activeFilter) {
      case "paid":
        result = result.filter(
          (customer) =>
            customer.totalPaid > 0 &&
            customer.totalPending <= 0
        );
        break;

      case "pending":
        result = result.filter(
          (customer) =>
            customer.totalPending > 0 ||
            customer.hasPending
        );
        break;

      case "high":
        result = result.filter(
          (customer) => customer.totalSpent >= 50000
        );
        break;

      case "low":
        result = result.filter(
          (customer) => customer.totalSpent < 50000
        );
        break;

      case "most":
        result.sort((a, b) => b.totalSpent - a.totalSpent);
        break;

      case "least":
        result.sort((a, b) => a.totalSpent - b.totalSpent);
        break;

      default:
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
    }

    return result;
  }, [customers, search, activeFilter]);

  // ---------------------------------------------------------
  // SUMMARY STATS
  // ---------------------------------------------------------

  const summary = useMemo(() => {
    const totalCustomers = customers.length;

    const totalRevenue = customers.reduce(
      (sum, customer) => sum + customer.totalSpent,
      0
    );

    const totalPaid = customers.reduce(
      (sum, customer) => sum + customer.totalPaid,
      0
    );

    const totalPending = customers.reduce(
      (sum, customer) => sum + customer.totalPending,
      0
    );

    const totalPurchases = customers.reduce(
      (sum, customer) => sum + customer.purchaseCount,
      0
    );

    const averageSpend =
      totalCustomers > 0
        ? totalRevenue / totalCustomers
        : 0;

    return {
      totalCustomers,
      totalRevenue,
      totalPaid,
      totalPending,
      totalPurchases,
      averageSpend,
    };
  }, [customers]);

  // ---------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length / CUSTOMERS_PER_PAGE
    )
  );

  const paginatedCustomers = useMemo(() => {
    const start =
      (currentPage - 1) * CUSTOMERS_PER_PAGE;

    return filteredCustomers.slice(
      start,
      start + CUSTOMERS_PER_PAGE
    );
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  const hasDateFilter =
    Boolean(appliedFromDate) ||
    Boolean(appliedToDate);

  return (
    <div className="customers-page">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="customers-content">
          {/* -------------------------------------------------
              HEADER
          ------------------------------------------------- */}

          <div className="customers-header">
            <div>
              <span className="customers-eyebrow">
                CUSTOMER MANAGEMENT
              </span>

              <h1>Customers</h1>

              <p>
                Understand your customers, spending patterns
                and payment activity.
              </p>
            </div>

            <button
              type="button"
              className="customers-refresh"
              onClick={loadCustomers}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "customers-refresh-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          {/* -------------------------------------------------
              DATE RANGE FILTER
          ------------------------------------------------- */}

          <section className="customer-date-card">
            <div className="customer-date-card-heading">
              <div className="customer-date-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <h3>Date Range</h3>
                <p>
                  View customer activity for a specific
                  period.
                </p>
              </div>
            </div>

            <div className="customer-date-controls">
              <div className="customer-date-field">
                <label htmlFor="customer-from-date">
                  From Date
                </label>

                <input
                  id="customer-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setDateError("");
                  }}
                />
              </div>

              <div className="customer-date-field">
                <label htmlFor="customer-to-date">
                  To Date
                </label>

                <input
                  id="customer-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setDateError("");
                  }}
                />
              </div>

              <button
                type="button"
                className="customer-date-apply"
                onClick={applyDateFilter}
              >
                <Check size={15} />
                Apply
              </button>

              {hasDateFilter && (
                <button
                  type="button"
                  className="customer-date-clear"
                  onClick={clearDateFilter}
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>

            {dateError && (
              <div className="customer-date-error">
                {dateError}
              </div>
            )}

            {hasDateFilter && !dateError && (
              <div className="customer-date-active">
                <CalendarDays size={14} />

                Showing customer data

                {appliedFromDate
                  ? ` from ${formatDate(appliedFromDate)}`
                  : ""}

                {appliedToDate
                  ? ` to ${formatDate(appliedToDate)}`
                  : ""}
              </div>
            )}
          </section>

          {/* -------------------------------------------------
              SUMMARY CARDS
          ------------------------------------------------- */}

          <section className="customers-summary-grid">
            <div className="customer-summary-card">
              <div className="customer-summary-icon purple">
                <Users size={20} />
              </div>

              <div>
                <span>Total Customers</span>
                <strong>{summary.totalCustomers}</strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon green">
                <IndianRupee size={20} />
              </div>

              <div>
                <span>Total Revenue</span>
                <strong>
                  {formatCurrency(summary.totalRevenue)}
                </strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon blue">
                <CreditCard size={20} />
              </div>

              <div>
                <span>Paid Amount</span>
                <strong>
                  {formatCurrency(summary.totalPaid)}
                </strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon orange">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Pending Amount</span>
                <strong>
                  {formatCurrency(summary.totalPending)}
                </strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon teal">
                <TrendingUp size={20} />
              </div>

              <div>
                <span>Avg. Customer Spend</span>
                <strong>
                  {formatCurrency(summary.averageSpend)}
                </strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon slate">
                <Database size={20} />
              </div>

              <div>
                <span>Total Purchases</span>
                <strong>{summary.totalPurchases}</strong>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------
              CUSTOMER LIST
          ------------------------------------------------- */}

          <section className="customers-list-card">
            <div className="customers-list-header">
              <div>
                <div className="customers-list-title">
                  <UserPlus size={19} />
                  <h2>Customer Directory</h2>
                </div>

                <p>
                  {filteredCustomers.length} customers found
                  {hasDateFilter
                    ? " for selected period"
                    : ""}
                </p>
              </div>

              <div className="customers-list-actions">
                <div className="customer-search">
                  <Search size={16} />

                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="customer-search-clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="customer-filter-wrapper">
                  <SlidersHorizontal size={15} />

                  <select
                    value={activeFilter}
                    onChange={(e) =>
                      setActiveFilter(e.target.value)
                    }
                  >
                    <option value="all">
                      All Customers
                    </option>

                    <option value="paid">
                      Fully Paid
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="high">
                      High Value
                    </option>

                    <option value="low">
                      Low Value
                    </option>

                    <option value="most">
                      Highest Spend
                    </option>

                    <option value="least">
                      Lowest Spend
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filter bar */}

            {(search || activeFilter !== "all") && (
              <div className="active-filter-bar">
                <span>
                  <SlidersHorizontal size={13} />
                  Active filters:
                </span>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Search: "{search}"
                    <X size={12} />
                  </button>
                )}

                {activeFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFilter("all")
                    }
                  >
                    {activeFilter === "paid" &&
                      "Fully Paid"}

                    {activeFilter === "pending" &&
                      "Pending"}

                    {activeFilter === "high" &&
                      "High Value"}

                    {activeFilter === "low" &&
                      "Low Value"}

                    {activeFilter === "most" &&
                      "Highest Spend"}

                    {activeFilter === "least" &&
                      "Lowest Spend"}

                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Loading */}

            {loading ? (
              <div className="customers-empty">
                <div className="customers-loading-icon">
                  <RefreshCw size={25} />
                </div>

                <h3>Loading customers...</h3>

                <p>
                  Fetching your customer information.
                </p>
              </div>
            ) : paginatedCustomers.length === 0 ? (
              <div className="customers-empty">
                <div className="customers-empty-icon">
                  <Users size={26} />
                </div>

                <h3>No customers found</h3>

                <p>
                  {hasDateFilter
                    ? "No customer transactions were found in the selected date range."
                    : "Upload business data containing customer information to see customers here."}
                </p>

                {hasDateFilter && (
                  <button
                    type="button"
                    className="empty-clear-date"
                    onClick={clearDateFilter}
                  >
                    Clear Date Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="customer-table-header">
                  <span>Customer</span>
                  <span>Purchases</span>
                  <span>Total Spent</span>
                  <span>Paid</span>
                  <span>Pending</span>
                  <span>Last Purchase</span>
                </div>

                <div className="customer-rows">
                  {paginatedCustomers.map(
                    (customer, index) => {
                      const initials = customer.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((word) =>
                          word.charAt(0).toUpperCase()
                        )
                        .join("");

                      return (
                        <div
                          className="customer-row"
                          key={`${customer.name}-${index}`}
                        >
                          <div className="customer-main">
                            <div className="customer-avatar">
                              {initials || "C"}
                            </div>

                            <div className="customer-info">
                              <strong>
                                {customer.name}
                              </strong>

                              <span>
                                {customer.purchaseCount}{" "}
                                transaction
                                {customer.purchaseCount !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <div className="customer-purchases">
                            {customer.purchaseCount}
                          </div>

                          <div className="customer-money total">
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </div>

                          <div className="customer-money paid">
                            {formatCurrency(
                              customer.totalPaid
                            )}
                          </div>

                          <div
                            className={`customer-money ${
                              customer.totalPending > 0
                                ? "pending"
                                : "settled"
                            }`}
                          >
                            {formatCurrency(
                              customer.totalPending
                            )}
                          </div>

                          <div className="customer-last-date">
                            {formatDate(
                              customer.lastPurchase
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Purchase history */}

                <div className="customer-history-section">
                  {paginatedCustomers.map(
                    (customer, index) => (
                      <div
                        className="customer-history-card"
                        key={`history-${customer.name}-${index}`}
                      >
                        <div className="customer-history-header">
                          <div>
                            <span className="history-label">
                              PURCHASE HISTORY
                            </span>

                            <strong>
                              {customer.name}
                            </strong>
                          </div>

                          <span className="history-total">
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </span>
                        </div>

                        <div className="purchase-history-list">
                          {customer.purchases
                            .slice()
                            .sort((a, b) => {
                              const dateA = new Date(
                                a.purchaseDate || 0
                              );

                              const dateB = new Date(
                                b.purchaseDate || 0
                              );

                              return dateB - dateA;
                            })
                            .slice(0, 5)
                            .map((purchase, purchaseIndex) => {
                              const product =
                                purchase.productName ??
                                purchase["Product Name"] ??
                                purchase.product ??
                                purchase.Product ??
                                "Purchase";

                              return (
                                <div
                                  className="purchase-history-item"
                                  key={purchaseIndex}
                                >
                                  <div>
                                    <strong>
                                      {product}
                                    </strong>

                                    <span>
                                      {formatDate(
                                        purchase.purchaseDate
                                      )}
                                    </span>
                                  </div>

                                  <div className="purchase-history-right">
                                    <strong>
                                      {formatCurrency(
                                        purchase.amount
                                      )}
                                    </strong>

                                    <span
                                      className={`history-status ${purchase.status}`}
                                    >
                                      {purchase.status ===
                                      "paid"
                                        ? "Paid"
                                        : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {customer.purchases.length > 5 && (
                          <div className="history-more">
                            +{" "}
                            {customer.purchases.length - 5}{" "}
                            more transaction
                            {customer.purchases.length -
                              5 !==
                            1
                              ? "s"
                              : ""}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Pagination */}

                {totalPages > 1 && (
                  <div className="customers-pagination">
                    <span>
                      Showing{" "}
                      {(currentPage - 1) *
                        CUSTOMERS_PER_PAGE +
                        1}{" "}
                      -{" "}
                      {Math.min(
                        currentPage *
                          CUSTOMERS_PER_PAGE,
                        filteredCustomers.length
                      )}{" "}
                      of {filteredCustomers.length}
                    </span>

                    <div className="pagination-buttons">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span>
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          currentPage === totalPages
                        }
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                          )
                        }
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Customers;