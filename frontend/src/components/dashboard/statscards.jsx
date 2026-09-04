import { useEffect, useState } from "react";

import {
  IndianRupee,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";

/* =========================================================
   FORMAT INR
========================================================= */

function formatINR(value) {
  const number = Number(value) || 0;

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

/* =========================================================
   GET UPLOADED LOCAL DATA
========================================================= */

function getLocalData() {
  try {
    const savedData = localStorage.getItem(
      "pulseiq_business_data"
    );

    if (!savedData) {
      return [];
    }

    const data = JSON.parse(savedData);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Local business data error:", error);
    return [];
  }
}

/* =========================================================
   CALCULATE ACTUAL DATA STATS
========================================================= */

function calculateLocalStats(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  /* ---------------- Revenue ---------------- */

  const revenue = rows.reduce((sum, row) => {
    const amount =
      Number(row.totalAmount) ||
      Number(row.total_amount) ||
      Number(row.amount) ||
      Number(row.total) ||
      0;

    return sum + amount;
  }, 0);

  /* ---------------- Customers ---------------- */

  const customers = new Set(
    rows
      .map(
        (row) =>
          row.customerName ||
          row.customer_name ||
          row.customer ||
          ""
      )
      .map((value) => String(value).trim())
      .filter(Boolean)
  ).size;

  /* ---------------- Orders ---------------- */

  const invoiceIds = new Set(
    rows
      .map(
        (row) =>
          row.invoiceId ||
          row.invoice_id ||
          row.orderId ||
          row.order_id ||
          ""
      )
      .map((value) => String(value).trim())
      .filter(Boolean)
  );

  const orders =
    invoiceIds.size > 0
      ? invoiceIds.size
      : rows.length;

  /* ---------------- Profit ---------------- */

  let hasProfitColumn = false;

  const profit = rows.reduce((sum, row) => {
    const profitValue =
      row.profit ??
      row.Profit ??
      row.profitAmount ??
      row.profit_amount ??
      row.netProfit ??
      row.net_profit;

    if (
      profitValue !== undefined &&
      profitValue !== null &&
      profitValue !== ""
    ) {
      hasProfitColumn = true;
    }

    return sum + (Number(profitValue) || 0);
  }, 0);

  return {
    revenue,
    orders,
    customers,
    profit,
    growth: null,
    source: "actual",
    hasProfitColumn,
  };
}

/* =========================================================
   USER ID
========================================================= */

function getUserId() {
  const directUserId =
    localStorage.getItem("pulseiq_user_id");

  if (directUserId) {
    return directUserId;
  }

  try {
    const user = JSON.parse(
      localStorage.getItem("pulseiq_user") || "null"
    );

    return user?.id || user?.user_id || null;
  } catch {
    return null;
  }
}

/* =========================================================
   STATS CARDS
========================================================= */

function StatsCards() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    profit: 0,
    growth: null,
    source: "demo",
    hasProfitColumn: false,
  });

  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard = async () => {
    setLoading(true);

    try {
      /* ---------------------------------------------------
         STEP 1:
         ALWAYS CHECK LOCAL UPLOADED DATA FIRST
      --------------------------------------------------- */

      const localRows = getLocalData();

      const localStats =
        calculateLocalStats(localRows);

      /* ---------------------------------------------------
         USER HAS UPLOADED CSV
         → USE ACTUAL DATA
      --------------------------------------------------- */

      if (localStats) {
        setStats(localStats);
        setLoading(false);
        return;
      }

      /* ---------------------------------------------------
         USER HAS NOT UPLOADED CSV
         → DEMO MODE
      --------------------------------------------------- */

      const userId = getUserId();

      /*
       * Backend is only being used to get the demo numbers.
       * IMPORTANT:
       * Even if backend returns source="actual",
       * the UI MUST show DEMO because there is no
       * pulseiq_business_data in localStorage.
       */

      if (!userId) {
        setStats({
          revenue: 0,
          orders: 0,
          customers: 0,
          profit: 0,
          growth: null,
          source: "demo",
          hasProfitColumn: false,
        });

        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard",
        {
          headers: {
            "X-User-Id": String(userId),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Dashboard request failed"
        );
      }

      const data = await response.json();

      /* ---------------------------------------------------
         IMPORTANT FIX:
         NO LOCAL DATA = ALWAYS DEMO
      --------------------------------------------------- */

      setStats({
        revenue: Number(data.revenue) || 0,
        orders: Number(data.orders) || 0,
        customers: Number(data.customers) || 0,
        profit: Number(data.profit) || 0,

        growth:
          data.growth !== null &&
          data.growth !== undefined
            ? Number(data.growth)
            : null,

        /*
         * DO NOT USE data.source HERE
         *
         * Backend may say actual, but if the user has
         * not uploaded CSV, dashboard is still DEMO.
         */
        source: "demo",

        hasProfitColumn: false,
      });
    } catch (error) {
      console.error(
        "Dashboard stats error:",
        error
      );

      /*
       * If backend fails, remain in DEMO mode.
       */
      setStats((previous) => ({
        ...previous,
        source: "demo",
      }));
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD + DATA UPDATE LISTENERS
  ======================================================= */

  useEffect(() => {
    loadDashboard();

    const handleUpdate = () => {
      loadDashboard();
    };

    window.addEventListener(
      "pulseiq-data-updated",
      handleUpdate
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  /* =======================================================
     GROWTH
  ======================================================= */

  const growthValue =
    stats.growth !== null &&
    stats.growth !== undefined
      ? Number(stats.growth)
      : null;

  /* =======================================================
     CARDS
  ======================================================= */

  const cards = [
    {
      title: "Revenue",

      value: loading
        ? "..."
        : formatINR(stats.revenue),

      change:
        growthValue !== null
          ? `${
              growthValue >= 0 ? "+" : ""
            }${growthValue.toFixed(1)}%`
          : stats.source === "actual"
          ? "From your data"
          : "Demo data",

      icon: IndianRupee,
    },

    {
      title: "Orders",

      value: loading
        ? "..."
        : stats.orders.toLocaleString("en-IN"),

      change:
        stats.source === "actual"
          ? "From your data"
          : "Demo data",

      icon: ShoppingBag,
    },

    {
      title: "Customers",

      value: loading
        ? "..."
        : stats.customers.toLocaleString("en-IN"),

      change:
        stats.source === "actual"
          ? "Unique customers"
          : "Demo data",

      icon: Users,
    },

    {
      title: "Profit",

      value: loading
        ? "..."
        : formatINR(stats.profit),

      change:
        stats.source === "actual"
          ? stats.hasProfitColumn
            ? "From your data"
            : "No profit column"
          : "Demo data",

      icon: WalletCards,
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="stat-card hover-lift"
          >
            <div className="stat-top">
              <div className="stat-icon">
                <Icon size={20} />
              </div>

              <span className="stat-change">
                {card.change}
              </span>
            </div>

            <p>{card.title}</p>

            <h2>{card.value}</h2>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;