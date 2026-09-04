import { useEffect, useState } from "react";

import {
  ShoppingCart,
  UserPlus,
  FileText,
  TrendingUp,
} from "lucide-react";

function getLocalActivities() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const latestRows = [...rows]
      .reverse()
      .slice(0, 4);

    return latestRows.map((row, index) => {
      const customer =
        row.customerName ||
        row.customer_name ||
        "Customer";

      const product =
        row.product ||
        row.productName ||
        row.product_name ||
        "Product";

      const amount =
        Number(row.totalAmount) ||
        Number(row.total_amount) ||
        Number(row.total) ||
        0;

      const date =
        row.purchaseDate ||
        row.purchase_date ||
        row.date ||
        "";

      const icons = [
        <ShoppingCart size={17} />,
        <UserPlus size={17} />,
        <TrendingUp size={17} />,
        <FileText size={17} />,
      ];

      const types = [
        "blue",
        "green",
        "orange",
        "yellow",
      ];

      return {
        icon: icons[index % icons.length],
        title:
          index === 0
            ? `New order from ${customer}`
            : index === 1
            ? `${customer} purchased ${product}`
            : `Revenue of ₹${amount.toLocaleString(
                "en-IN"
              )} recorded`,

        time: date || "Recently",

        type: types[index % types.length],
      };
    });
  } catch {
    return [];
  }
}

function RecentActivity() {
  const [activities, setActivities] =
    useState([]);

  const loadActivities = () => {
    const localActivities =
      getLocalActivities();

    setActivities(localActivities);
  };

  useEffect(() => {
    loadActivities();

    const handleUpdate = () => {
      loadActivities();
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

  return (
    <div className="recent-activity-card">

      <div className="section-card-header">
        <div>
          <span className="chart-label">
            ACTIVITY
          </span>

          <h2>Recent Activity</h2>
        </div>

        <span className="live-indicator">
          <span />
          Live
        </span>
      </div>

      <div className="recent-activity-list">
        {activities.length === 0 ? (
          <div className="chart-loading">
            No recent activity available
          </div>
        ) : (
          activities.map(
            (item, index) => (
              <div
                key={index}
                className="recent-activity-item"
              >
                <div
                  className={`recent-activity-icon ${item.type}`}
                >
                  {item.icon}
                </div>

                <div className="recent-activity-content">
                  <p className="recent-activity-name">
                    {item.title}
                  </p>

                  <p className="recent-activity-time">
                    {item.time}
                  </p>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

export default RecentActivity;