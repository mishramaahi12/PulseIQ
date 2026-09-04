import { useEffect, useState } from "react";

import {
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

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

function getLocalRevenue() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const grouped = {};

    rows.forEach((row) => {
      const amount =
        Number(row.totalAmount) ||
        Number(row.total_amount) ||
        Number(row.total) ||
        0;

      const date =
        row.purchaseDate ||
        row.purchase_date ||
        row.date;

      if (!amount) return;

      let label = "Other";

      if (date) {
        const parsed = new Date(date);

        if (!Number.isNaN(parsed.getTime())) {
          label = parsed.toLocaleDateString(
            "en-US",
            {
              month: "short",
            }
          );
        }
      }

      if (!grouped[label]) {
        grouped[label] = 0;
      }

      grouped[label] += amount;
    });

    const revenue = Object.entries(grouped).map(
      ([month, value]) => ({
        month,
        value,
      })
    );

    return {
      revenue,
      totalRevenue: revenue.reduce(
        (sum, item) => sum + item.value,
        0
      ),
      source: "actual",
      growth: null,
    };
  } catch {
    return null;
  }
}

function getUserId() {
  const direct =
    localStorage.getItem("pulseiq_user_id");

  if (direct) return direct;

  try {
    const user = JSON.parse(
      localStorage.getItem("pulseiq_user") || "null"
    );

    return user?.id || user?.user_id || null;
  } catch {
    return null;
  }
}

function RevenueChart() {
  const [revenue, setRevenue] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growth, setGrowth] = useState(null);
  const [source, setSource] = useState("demo");
  const [loading, setLoading] = useState(true);

  const loadRevenue = async () => {
    setLoading(true);

    try {
      const localData = getLocalRevenue();

      if (localData) {
        setRevenue(localData.revenue);
        setTotalRevenue(localData.totalRevenue);
        setGrowth(localData.growth);
        setSource(localData.source);
        setLoading(false);
        return;
      }

      const userId = getUserId();

      if (!userId) {
        setRevenue([]);
        setTotalRevenue(0);
        setSource("demo");
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

      setSource(data.source || "demo");
      setTotalRevenue(
        Number(data.revenue) || 0
      );

      setGrowth(
        data.growth !== null &&
          data.growth !== undefined
          ? Number(data.growth)
          : null
      );

      const chartData =
        data.analysis?.chart_data || [];

      setRevenue(
        chartData
          .map((item, index) => ({
            month:
              item.month ||
              item.label ||
              `${index + 1}`,

            value:
              Number(item.value) || 0,
          }))
          .filter(
            (item) => item.value >= 0
          )
      );
    } catch (error) {
      console.error(
        "Revenue chart error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();

    const handleUpdate = () => {
      loadRevenue();
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

  const maxValue = Math.max(
    ...revenue.map(
      (item) => item.value
    ),
    1
  );

  const chartValues = [
    maxValue,
    maxValue * 0.75,
    maxValue * 0.5,
    maxValue * 0.25,
    0,
  ];

  return (
    <div className="revenue-chart-card">

      <div className="chart-header">
        <div>
          <span className="eyebrow">
            REVENUE
          </span>

          <h2>
            Revenue Overview
          </h2>

          <p>
            {source === "actual"
              ? "Revenue performance from your business data"
              : "Revenue performance from demo data"}
          </p>
        </div>

        <button
          className="chart-menu-button"
          type="button"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="revenue-summary">
        <div>
          <strong>
            {loading
              ? "..."
              : formatINR(totalRevenue)}
          </strong>

          {growth !== null ? (
            <span className="revenue-growth">
              <TrendingUp size={13} />

              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </span>
          ) : (
            <span className="revenue-growth">
              Actual data
            </span>
          )}
        </div>

        <span className="revenue-period">
          {revenue.length > 0
            ? `${revenue.length} data points`
            : "No chart data"}
        </span>
      </div>

      <div className="chart-area">

        <div className="chart-y-axis">
          {chartValues.map(
            (value, index) => (
              <span key={index}>
                {formatINR(value)}
              </span>
            )
          )}
        </div>

        <div className="chart-content">

          <div className="chart-grid-lines">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="chart-bars">
            {loading ? (
              <div className="chart-loading">
                Loading revenue data...
              </div>
            ) : revenue.length === 0 ? (
              <div className="chart-loading">
                No revenue data available
              </div>
            ) : (
              revenue.map(
                (item, index) => (
                  <div
                    className="chart-bar-wrapper"
                    key={`${item.month}-${index}`}
                  >
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(
                          (item.value /
                            maxValue) *
                            100,
                          4
                        )}%`,
                      }}
                      title={`${item.month}: ${formatINR(
                        item.value
                      )}`}
                    />

                    <span>
                      {item.month}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;