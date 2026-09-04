import { useEffect, useState } from "react";

function getHealthMetrics() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [
        { label: "Revenue", value: 0 },
        { label: "Customers", value: 0 },
        { label: "Inventory", value: 0 },
        { label: "Satisfaction", value: 0 },
      ];
    }

    const revenue = rows.reduce(
      (sum, row) =>
        sum +
        (Number(row.totalAmount) ||
          Number(row.total_amount) ||
          Number(row.total) ||
          0),
      0
    );

    const customers = new Set(
      rows
        .map(
          (row) =>
            row.customerName ||
            row.customer_name ||
            ""
        )
        .map((value) =>
          String(value).trim()
        )
        .filter(Boolean)
    ).size;

    const paid = rows.filter((row) => {
      const status = String(
        row.paymentStatus ||
          row.payment_status ||
          ""
      ).toLowerCase();

      return (
        status.includes("paid") ||
        status.includes("complete")
      );
    }).length;

    const paymentHealth =
      rows.length > 0
        ? Math.round(
            (paid / rows.length) * 100
          )
        : 0;

    return [
      {
        label: "Revenue",
        value: revenue > 0 ? 100 : 0,
      },
      {
        label: "Customers",
        value:
          customers > 0 ? 100 : 0,
      },
      {
        label: "Inventory",
        value: 0,
      },
      {
        label: "Satisfaction",
        value: paymentHealth,
      },
    ];
  } catch {
    return [
      { label: "Revenue", value: 0 },
      { label: "Customers", value: 0 },
      { label: "Inventory", value: 0 },
      { label: "Satisfaction", value: 0 },
    ];
  }
}

function BusinessHealth() {
  const [metrics, setMetrics] =
    useState(getHealthMetrics());

  useEffect(() => {
    const update = () => {
      setMetrics(getHealthMetrics());
    };

    window.addEventListener(
      "pulseiq-data-updated",
      update
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      update
    );

    window.addEventListener(
      "storage",
      update
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        update
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        update
      );

      window.removeEventListener(
        "storage",
        update
      );
    };
  }, []);

  return (
    <div className="dashboard-card">
      <h2>Business Health</h2>

      <div className="health-list">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="health-item"
          >
            <div className="health-label">
              <span>
                {item.label}
              </span>

              <strong>
                {item.value}%
              </strong>
            </div>

            <div className="health-track">
              <div
                className="health-fill"
                style={{
                  width: `${item.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusinessHealth;