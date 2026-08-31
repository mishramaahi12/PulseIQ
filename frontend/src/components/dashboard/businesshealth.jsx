function BusinessHealth() {
  const metrics = [
    { label: "Revenue", value: 90 },
    { label: "Customers", value: 82 },
    { label: "Inventory", value: 74 },
    { label: "Satisfaction", value: 95 },
  ];

  return (
    <div className="dashboard-card">

      <h2>Business Health</h2>

      <div className="health-list">
        {metrics.map((item) => (
          <div key={item.label} className="health-item">

            <div className="health-label">
              <span>{item.label}</span>
              <strong>{item.value}%</strong>
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