import { useEffect, useMemo, useState } from "react";

import {
  WalletCards,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Save,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building2,
  CalendarDays,
  Receipt,
  Activity,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./expenses.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

const getUserId = () => {
  try {
    const rawUser = localStorage.getItem("pulseiq_user");

    if (!rawUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser);

      if (
        typeof parsed === "number" ||
        typeof parsed === "string"
      ) {
        return String(parsed);
      }

      if (
        parsed?.id !== undefined &&
        parsed?.id !== null
      ) {
        return String(parsed.id);
      }

      if (
        parsed?.user_id !== undefined &&
        parsed?.user_id !== null
      ) {
        return String(parsed.user_id);
      }

      if (
        parsed?.userId !== undefined &&
        parsed?.userId !== null
      ) {
        return String(parsed.userId);
      }
    } catch {
      return String(rawUser);
    }

    return null;
  } catch {
    return null;
  }
};

const getHeaders = (includeJson = false) => {
  const userId = getUserId();

  const headers = {
    Accept: "application/json",
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (userId) {
    headers["x-user-id"] = userId;
  }

  return headers;
};

const getErrorMessage = async (
  response,
  fallback
) => {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            const field = Array.isArray(item.loc)
              ? item.loc[item.loc.length - 1]
              : "";

            return field
              ? `${field}: ${item.msg}`
              : item.msg;
          }

          return JSON.stringify(item);
        })
        .filter(Boolean);

      if (messages.length) {
        return messages.join(" | ");
      }
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }

    return fallback;
  } catch {
    return fallback;
  }
};

const normalizeExpense = (item) => ({
  id: item?.id,

  date:
    item?.expense_date ||
    item?.date ||
    item?.expenseDate ||
    "",

  name:
    item?.expense_name ||
    item?.name ||
    item?.expenseName ||
    "Unnamed Expense",

  category:
    item?.category ||
    "Other",

  amount:
    Number(
      item?.amount ??
        item?.expense_amount ??
        item?.expenseAmount ??
        0
    ) || 0,

  payment_method:
    item?.payment_method ||
    item?.paymentMethod ||
    "Other",

  vendor:
    item?.vendor ||
    item?.paid_to ||
    item?.paidTo ||
    "",

  description:
    item?.description ||
    "",
});

const formatINR = (value) => {
  const number = Number(value) || 0;

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const getInitialForm = () => ({
  date: new Date().toISOString().split("T")[0],
  name: "",
  category: "Inventory",
  amount: "",
  payment_method: "UPI",
  vendor: "",
  description: "",
});

/* =========================================================
   CONSTANTS
========================================================= */

const categories = [
  "Inventory",
  "Marketing",
  "Delivery",
  "Utilities",
  "Salary",
  "Rent",
  "Software",
  "Office",
  "Travel",
  "Other",
];

const paymentMethods = [
  "UPI",
  "Cash",
  "Card",
  "Bank Transfer",
  "Cheque",
  "Other",
];

/* =========================================================
   COMPONENT
========================================================= */

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(getInitialForm());
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [paymentFilter, setPaymentFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [summary, setSummary] = useState(null);

  /* =======================================================
     FETCH EXPENSES
  ======================================================= */

  const fetchExpenses = async () => {
    try {
      setError("");

      const userId = getUserId();

      if (!userId) {
        throw new Error(
          "User ID nahi mila. Please logout karke dobara login karo."
        );
      }

      const response = await fetch(
        `${API_URL}/expenses`,
        {
          method: "GET",
          headers: getHeaders(false),
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          `Unable to load expenses. Server returned ${response.status}.`
        );

        throw new Error(message);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.expenses)
        ? data.expenses
        : [];

      setExpenses(list.map(normalizeExpense));
    } catch (err) {
      console.error(
        "Fetch expenses error:",
        err
      );

      setError(
        err?.message ||
          "Expenses load nahi ho paaye."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     FETCH SUMMARY
  ======================================================= */

  const fetchSummary = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        return;
      }

      const response = await fetch(
        `${API_URL}/expenses/summary`,
        {
          method: "GET",
          headers: getHeaders(false),
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setSummary(data || null);
    } catch (err) {
      console.error(
        "Expense summary error:",
        err
      );
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchExpenses(),
      fetchSummary(),
    ]);
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     OPEN ADD FORM
  ======================================================= */

  const openAddForm = () => {
    setEditingId(null);
    setForm(getInitialForm());

    setError("");
    setSuccess("");

    setShowForm(true);

    setTimeout(() => {
      const formElement =
        document.querySelector(
          ".expense-form-card"
        );

      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(getInitialForm());
  };

  /* =======================================================
     SAVE / UPDATE EXPENSE
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const userId = getUserId();

    if (!userId) {
      setError(
        "User ID nahi mila. Please logout karke dobara login karo."
      );
      return;
    }

    if (!form.date) {
      setError("Expense date select karo.");
      return;
    }

    if (!form.name.trim()) {
      setError("Expense name enter karo.");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Valid expense amount enter karo."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        expense_date: form.date,
        expense_name: form.name.trim(),
        category: form.category,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        vendor: form.vendor.trim(),
        description: form.description.trim(),
      };

      const url = editingId
        ? `${API_URL}/expenses/${editingId}`
        : `${API_URL}/expenses`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          `Unable to save expense. Server returned ${response.status}.`
        );

        throw new Error(message);
      }

      await response
        .json()
        .catch(() => null);

      setSuccess(
        editingId
          ? "Expense successfully updated."
          : "Expense successfully added."
      );

      setForm(getInitialForm());
      setEditingId(null);
      setShowForm(false);

      await Promise.all([
        fetchExpenses(),
        fetchSummary(),
      ]);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Save expense error:",
        err
      );

      setError(
        err?.message ||
          "Expense save nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      date:
        expense.date ||
        new Date()
          .toISOString()
          .split("T")[0],

      name:
        expense.name || "",

      category:
        expense.category || "Other",

      amount:
        expense.amount ?? "",

      payment_method:
        expense.payment_method || "Other",

      vendor:
        expense.vendor || "",

      description:
        expense.description || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    setTimeout(() => {
      const formElement =
        document.querySelector(
          ".expense-form-card"
        );

      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/expenses/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(false),
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          `Unable to delete expense. Server returned ${response.status}.`
        );

        throw new Error(message);
      }

      setExpenses((previous) =>
        previous.filter(
          (expense) =>
            expense.id !== id
        )
      );

      setSuccess(
        "Expense deleted successfully."
      );

      await fetchSummary();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Delete expense error:",
        err
      );

      setError(
        err?.message ||
          "Expense delete nahi ho paaya."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredExpenses = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.name
          .toLowerCase()
          .includes(query) ||
        expense.vendor
          .toLowerCase()
          .includes(query) ||
        expense.description
          .toLowerCase()
          .includes(query) ||
        expense.category
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        expense.category ===
          categoryFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        expense.payment_method ===
          paymentFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment
      );
    });
  }, [
    expenses,
    search,
    categoryFilter,
    paymentFilter,
  ]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setPaymentFilter("All");
  };

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const expenseCount =
    expenses.length;

  const averageExpense =
    expenseCount > 0
      ? totalExpenses / expenseCount
      : 0;

  const highestExpense =
    useMemo(() => {
      if (!expenses.length) {
        return null;
      }

      return expenses.reduce(
        (highest, current) => {
          if (!highest) {
            return current;
          }

          return Number(current.amount) >
            Number(highest.amount)
            ? current
            : highest;
        },
        null
      );
    }, [expenses]);

  const categoryTotals =
    useMemo(() => {
      const totals = {};

      expenses.forEach((expense) => {
        const category =
          expense.category || "Other";

        totals[category] =
          (totals[category] || 0) +
          Number(expense.amount || 0);
      });

      return Object.entries(totals)
        .map(
          ([category, amount]) => ({
            category,
            amount,
            percentage:
              totalExpenses > 0
                ? (amount /
                    totalExpenses) *
                  100
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.amount - a.amount
        );
    }, [expenses, totalExpenses]);

  const highestCategory =
    categoryTotals.length
      ? categoryTotals[0]
      : null;

  /* =======================================================
     BACKEND SUMMARY
  ======================================================= */

  const revenue = Number(
    summary?.total_revenue ??
      summary?.revenue ??
      0
  );

  const backendTotalExpenses =
    Number(
      summary?.total_expenses ??
        totalExpenses
    );

  const netProfit = Number(
    summary?.net_profit ??
      revenue -
        backendTotalExpenses
  );

  const expenseRatio = Number(
    summary?.expense_ratio ??
      (revenue > 0
        ? (backendTotalExpenses /
            revenue) *
          100
        : 0)
  );

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Number(
        summary?.health_score ?? 100
      )
    )
  );

  const healthLabel =
    healthScore >= 80
      ? "Healthy"
      : healthScore >= 60
      ? "Moderate"
      : "Needs Attention";

  const backendAlerts =
    Array.isArray(summary?.alerts)
      ? summary.alerts
      : [];

  const savingOpportunities =
    Array.isArray(
      summary?.saving_opportunities
    )
      ? summary.saving_opportunities
      : [];

  /* =======================================================
     FALLBACK ALERTS
  ======================================================= */

  const alerts =
    backendAlerts.length > 0
      ? backendAlerts
      : (() => {
          const result = [];

          if (expenseRatio >= 50) {
            result.push({
              type: "danger",
              message:
                "Expenses are taking a very high share of revenue.",
            });
          } else if (
            expenseRatio >= 30
          ) {
            result.push({
              type: "warning",
              message:
                "Expense ratio is relatively high.",
            });
          }

          if (
            highestCategory &&
            highestCategory.percentage >=
              50
          ) {
            result.push({
              type: "warning",
              message:
                `${highestCategory.category} is your largest expense category, ` +
                `accounting for ${highestCategory.percentage.toFixed(
                  1
                )}% of total expenses. ` +
                "Reviewing this category could help identify potential cost-saving opportunities.",
            });
          }

          if (
            highestExpense &&
            averageExpense > 0 &&
            Number(
              highestExpense.amount
            ) >
              averageExpense * 3
          ) {
            result.push({
              type: "info",
              message:
                `${highestExpense.name} is significantly higher than your average expense.`,
            });
          }

          return result;
        })();

  const getAlertMessage = (alert) => {
    if (typeof alert === "string") {
      return alert;
    }

    if (
      alert?.title ===
        "Category Concentration" &&
      highestCategory
    ) {
      return (
        `${highestCategory.category} is your largest expense category, ` +
        `accounting for ${highestCategory.percentage.toFixed(
          1
        )}% of total expenses. ` +
        "Reviewing this category could help identify potential cost-saving opportunities."
      );
    }

    return (
      alert?.message ||
      alert?.text ||
      "Review your expenses."
    );
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="expenses-page">

          {/* HEADER */}

          <div className="expenses-header">
            <div className="expenses-title-row">
              <div className="expenses-title-icon">
                <WalletCards size={25} />
              </div>

              <div>
                <h1>Expenses</h1>

                <p>
                  Track spending, control
                  costs and understand your
                  money flow.
                </p>
              </div>
            </div>

            <div className="expenses-header-actions">

              <button
                type="button"
                className="expense-refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "expense-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                className="expense-primary-btn"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add Expense
              </button>

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="expense-alert-banner error">
              <AlertTriangle size={18} />

              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="expense-alert-banner success">
              <CheckCircle2 size={18} />

              <span>{success}</span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* KPI */}

          <section className="expense-kpi-grid">

            <div className="expense-kpi-card">
              <div className="expense-kpi-top">
                <span>Total Expenses</span>

                <div className="expense-kpi-icon purple">
                  <TrendingDown size={20} />
                </div>
              </div>

              <strong>
                {formatINR(
                  backendTotalExpenses
                )}
              </strong>

              <small>
                {expenseCount} expense
                {expenseCount !== 1
                  ? "s"
                  : ""}{" "}
                recorded
              </small>
            </div>

            <div className="expense-kpi-card">
              <div className="expense-kpi-top">
                <span>Expense Ratio</span>

                <div className="expense-kpi-icon red">
                  <Activity size={20} />
                </div>
              </div>

              <strong>
                {expenseRatio.toFixed(1)}%
              </strong>

              <small>
                of total revenue
              </small>
            </div>

            <div className="expense-kpi-card">
              <div className="expense-kpi-top">
                <span>Highest Category</span>

                <div className="expense-kpi-icon orange">
                  <Receipt size={20} />
                </div>
              </div>

              <strong className="expense-kpi-category">
                {summary?.highest_category ||
                  highestCategory?.category ||
                  "—"}
              </strong>

              <small>
                {highestCategory
                  ? formatINR(
                      highestCategory.amount
                    )
                  : "No expenses"}
              </small>
            </div>

            <div className="expense-kpi-card">
              <div className="expense-kpi-top">
                <span>Average Expense</span>

                <div className="expense-kpi-icon blue">
                  <IndianRupee size={20} />
                </div>
              </div>

              <strong>
                {formatINR(
                  summary?.average_expense ??
                    averageExpense
                )}
              </strong>

              <small>
                per transaction
              </small>
            </div>

          </section>

          {/* ADD / EDIT FORM */}

          {showForm && (
            <section className="expense-form-card">

              <div className="expense-form-header">

                <div>
                  <h2>
                    {editingId
                      ? "Edit Expense"
                      : "Add New Expense"}
                  </h2>

                  <p>
                    Enter the details of your
                    business expense.
                  </p>
                </div>

                <button
                  type="button"
                  className="expense-close-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  <X size={19} />
                </button>

              </div>

              <form
                className="expense-form"
                onSubmit={handleSubmit}
              >

                <div className="expense-form-grid">

                  <div className="expense-field">
                    <label>
                      Expense Date
                    </label>

                    <div className="expense-input-wrap">
                      <CalendarDays size={17} />

                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="expense-field">
                    <label>
                      Expense Name
                    </label>

                    <div className="expense-input-wrap">
                      <Receipt size={17} />

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Office supplies"
                        required
                      />
                    </div>
                  </div>

                  <div className="expense-field">
                    <label>
                      Expense Category
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="expense-field">
                    <label>
                      Amount
                    </label>

                    <div className="expense-input-wrap">
                      <IndianRupee size={17} />

                      <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="expense-field">
                    <label>
                      Payment Method
                    </label>

                    <select
                      name="payment_method"
                      value={
                        form.payment_method
                      }
                      onChange={handleChange}
                    >
                      {paymentMethods.map(
                        (method) => (
                          <option
                            key={method}
                            value={method}
                          >
                            {method}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="expense-field">
                    <label>
                      Vendor / Paid To
                    </label>

                    <div className="expense-input-wrap">
                      <Building2 size={17} />

                      <input
                        type="text"
                        name="vendor"
                        value={form.vendor}
                        onChange={handleChange}
                        placeholder="e.g. Amazon / Supplier"
                      />
                    </div>
                  </div>

                  <div className="expense-field full">
                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={handleChange}
                      placeholder="Add any additional notes..."
                      rows="3"
                    />
                  </div>

                </div>

                <div className="expense-form-actions">

                  <button
                    type="button"
                    className="expense-cancel-btn"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="expense-save-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="expense-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />

                        {editingId
                          ? "Update Expense"
                          : "Save Expense"}
                      </>
                    )}
                  </button>

                </div>

              </form>
            </section>
          )}

          {/* MONEY FLOW */}

          <section className="money-flow-section">

            <div className="section-heading">
              <div>
                <h2>Money Flow</h2>

                <p>
                  Understand how revenue is
                  moving through your
                  business.
                </p>
              </div>
            </div>

            <div className="money-flow-grid">

              <div className="money-flow-card revenue">
                <div className="money-flow-icon">
                  <ArrowDownRight size={20} />
                </div>

                <div>
                  <span>Revenue</span>

                  <strong>
                    {formatINR(revenue)}
                  </strong>
                </div>
              </div>

              <div className="money-flow-arrow">
                →
              </div>

              <div className="money-flow-card expense">
                <div className="money-flow-icon">
                  <ArrowUpRight size={20} />
                </div>

                <div>
                  <span>Expenses</span>

                  <strong>
                    {formatINR(
                      backendTotalExpenses
                    )}
                  </strong>
                </div>
              </div>

              <div className="money-flow-arrow">
                →
              </div>

              <div className="money-flow-card profit">
                <div className="money-flow-icon">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <span>Net Profit</span>

                  <strong>
                    {formatINR(netProfit)}
                  </strong>
                </div>
              </div>

            </div>
          </section>

          {/* HEALTH + SMART INSIGHTS */}

          <section className="expense-insight-grid">

            <div className="expense-health-card">

              <div className="insight-card-header">
                <div>
                  <h2>
                    Expense Health
                  </h2>

                  <p>
                    Overall spending
                    efficiency
                  </p>
                </div>

                <Activity size={21} />
              </div>

              <div className="health-score-wrapper">

                <div className="health-score">
                  {healthScore}
                </div>

                <div className="health-score-label">
                  / 100
                </div>

              </div>

              <div className="health-progress">
                <div
                  style={{
                    width: `${healthScore}%`,
                  }}
                />
              </div>

              <div className="health-status">

                {healthScore >= 80 ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle
                    size={17}
                  />
                )}

                <span>
                  {healthLabel}
                </span>

              </div>
            </div>

            <div className="expense-smart-card">

              <div className="insight-card-header">

                <div>
                  <h2>
                    Smart Insights
                  </h2>

                  <p>
                    Expense intelligence
                    from PulseIQ
                  </p>
                </div>

                <Lightbulb size={21} />

              </div>

              <div className="smart-insight-list">

                {alerts.length > 0 ? (
                  alerts
                    .slice(0, 4)
                    .map(
                      (alert, index) => (
                        <div
                          className={`smart-insight-item ${
                            alert?.type ||
                            "info"
                          }`}
                          key={index}
                        >
                          <AlertTriangle
                            size={17}
                          />

                          <span>
                            {getAlertMessage(
                              alert
                            )}
                          </span>
                        </div>
                      )
                    )
                ) : (
                  <div className="smart-insight-item success">

                    <CheckCircle2
                      size={17}
                    />

                    <span>
                      Your current expense
                      pattern looks healthy.
                    </span>

                  </div>
                )}

              </div>
            </div>

          </section>

          {/* EXPENSE LEDGER */}

          <section className="expense-ledger-card">

            <div className="ledger-header">

              <div>
                <h2>
                  Expense Ledger
                </h2>

                <p>
                  {filteredExpenses.length}{" "}
                  of {expenses.length}{" "}
                  expenses shown
                </p>
              </div>

              <button
                type="button"
                className="expense-primary-btn ledger-add-btn"
                onClick={openAddForm}
              >
                <Plus size={17} />
                Add Expense
              </button>

            </div>

            <div className="expense-filters">

              <div className="expense-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search expenses, vendors..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="expense-filter">
                <Filter size={16} />

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="expense-filter">
                <CreditCard size={16} />

                <select
                  value={paymentFilter}
                  onChange={(event) =>
                    setPaymentFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Payments
                  </option>

                  {paymentMethods.map(
                    (method) => (
                      <option
                        key={method}
                        value={method}
                      >
                        {method}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            <div className="expense-table-wrapper">

              {loading ? (
                <div className="expense-empty-state">

                  <RefreshCw
                    size={24}
                    className="expense-spin"
                  />

                  <p>
                    Loading expenses...
                  </p>

                </div>
              ) : (
                <table className="expense-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Expense</th>
                      <th>Category</th>
                      <th>
                        Vendor / Paid To
                      </th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {expenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="expense-empty-cell"
                        >
                          <div className="ledger-empty-content">

                            <div className="ledger-empty-icon">
                              <Receipt size={25} />
                            </div>

                            <div>
                              <strong>
                                No expenses recorded
                              </strong>

                              <span>
                                Click the Add Expense
                                button above to
                                record your first
                                business expense.
                              </span>
                            </div>

                          </div>
                        </td>
                      </tr>
                    ) : filteredExpenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="expense-empty-cell"
                        >
                          <div className="ledger-empty-content">

                            <div className="ledger-empty-icon">
                              <Search size={25} />
                            </div>

                            <div>
                              <strong>
                                No expenses found
                              </strong>

                              <span>
                                No expenses match your
                                current search or
                                filters.
                              </span>
                            </div>

                            <button
                              type="button"
                              className="expense-clear-btn"
                              onClick={
                                clearFilters
                              }
                            >
                              Clear Filters
                            </button>

                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map(
                        (expense) => (
                          <tr
                            key={expense.id}
                          >

                            <td>
                              {formatDate(
                                expense.date
                              )}
                            </td>

                            <td>
                              <div className="expense-name-cell">

                                <strong>
                                  {expense.name}
                                </strong>

                                {expense.description && (
                                  <small>
                                    {
                                      expense.description
                                    }
                                  </small>
                                )}

                              </div>
                            </td>

                            <td>
                              <span className="expense-category-badge">
                                {
                                  expense.category
                                }
                              </span>
                            </td>

                            <td>
                              {expense.vendor ||
                                "—"}
                            </td>

                            <td>
                              <span className="payment-method-badge">
                                {
                                  expense.payment_method
                                }
                              </span>
                            </td>

                            <td>
                              <strong className="expense-amount">
                                {formatINR(
                                  expense.amount
                                )}
                              </strong>
                            </td>

                            <td>
                              <div className="expense-row-actions">

                                <button
                                  type="button"
                                  className="expense-edit-btn"
                                  onClick={() =>
                                    handleEdit(
                                      expense
                                    )
                                  }
                                  title="Edit expense"
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="expense-delete-btn"
                                  onClick={() =>
                                    handleDelete(
                                      expense.id
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    expense.id
                                  }
                                  title="Delete expense"
                                >
                                  {deletingId ===
                                  expense.id ? (
                                    <RefreshCw
                                      size={16}
                                      className="expense-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={16}
                                    />
                                  )}
                                </button>

                              </div>
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>
              )}

            </div>

          </section>

          {/* EXPENSE BREAKDOWN */}

          <section className="expense-breakdown-card">

            <div className="section-heading">

              <div>
                <h2>
                  Expense Breakdown
                </h2>

                <p>
                  See where your money is
                  going.
                </p>
              </div>

            </div>

            {categoryTotals.length === 0 ? (
              <div className="expense-breakdown-empty">
                No expense data available
                yet.
              </div>
            ) : (
              <div className="category-breakdown-list">

                {categoryTotals.map(
                  (item) => (
                    <div
                      className="category-breakdown-item"
                      key={item.category}
                    >

                      <div className="category-breakdown-top">

                        <div>
                          <strong>
                            {item.category}
                          </strong>

                          <span>
                            {item.percentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>

                        <strong>
                          {formatINR(
                            item.amount
                          )}
                        </strong>

                      </div>

                      <div className="category-progress">

                        <div
                          style={{
                            width: `${Math.min(
                              item.percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* SAVING OPPORTUNITIES */}

          <section className="saving-opportunities-card">

            <div className="section-heading">

              <div>
                <h2>
                  Potential Cost Savings
                </h2>

                <p>
                  Areas where you may be
                  able to reduce spending.
                </p>
              </div>

              <Lightbulb size={21} />

            </div>

            {savingOpportunities.length > 0 ? (

              <div className="saving-list">

                {savingOpportunities
                  .slice(0, 5)
                  .map(
                    (item, index) => {

                      const category =
                        item?.category ||
                        item?.name ||
                        "Category";

                      const potential =
                        Number(
                          item?.potential_saving ??
                            item?.potential_savings ??
                            item?.saving ??
                            0
                        );

                      return (
                        <div
                          className="saving-item"
                          key={index}
                        >

                          <div className="saving-icon">
                            <TrendingDown
                              size={18}
                            />
                          </div>

                          <div className="saving-content">

                            <strong>
                              {category}
                            </strong>

                            <span>
                              Consider reviewing
                              spending in this
                              category.
                            </span>

                          </div>

                          {potential > 0 && (
                            <strong className="saving-amount">
                              Save up to{" "}
                              {formatINR(
                                potential
                              )}
                            </strong>
                          )}

                        </div>
                      );
                    }
                  )}

              </div>

            ) : categoryTotals.length > 0 ? (

              <div className="saving-list">

                {categoryTotals
                  .filter(
                    (item) =>
                      item.percentage >=
                      20
                  )
                  .slice(0, 3)
                  .map((item) => {

                    const potential =
                      item.amount * 0.1;

                    return (
                      <div
                        className="saving-item"
                        key={
                          item.category
                        }
                      >

                        <div className="saving-icon">
                          <TrendingDown
                            size={18}
                          />
                        </div>

                        <div className="saving-content">

                          <strong>
                            Review{" "}
                            {item.category}
                          </strong>

                          <span>
                            This category
                            represents{" "}
                            {item.percentage.toFixed(
                              1
                            )}
                            % of your
                            expenses.
                          </span>

                        </div>

                        <strong className="saving-amount">
                          Potential{" "}
                          {formatINR(
                            potential
                          )}
                        </strong>

                      </div>
                    );
                  })}

                {categoryTotals.filter(
                  (item) =>
                    item.percentage >=
                    20
                ).length === 0 && (
                  <div className="saving-empty">
                    No major cost-saving
                    opportunity detected
                    yet.
                  </div>
                )}

              </div>

            ) : (

              <div className="saving-empty">
                Add more expenses to
                generate cost-saving
                recommendations.
              </div>

            )}

          </section>

        </div>
      </main>
    </div>
  );
}

export default Expenses;