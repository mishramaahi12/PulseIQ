import {
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

function RevenueChart() {
  const revenue = [
    { month: "Jan", value: 42 },
    { month: "Feb", value: 51 },
    { month: "Mar", value: 47 },
    { month: "Apr", value: 64 },
    { month: "May", value: 58 },
    { month: "Jun", value: 72 },
    { month: "Jul", value: 86 },
    { month: "Aug", value: 94 },
  ];

  return (
    <div className="revenue-chart-card">
      <div className="chart-header">
        <div>
          <span className="eyebrow">
            REVENUE
          </span>

          <h2>Revenue Overview</h2>

          <p>
            Monthly revenue performance
          </p>
        </div>

        <button className="chart-menu-button">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="revenue-summary">
        <div>
          <strong>₹12.4L</strong>

          <span className="revenue-growth">
            <TrendingUp size={13} />
            18.4%
          </span>
        </div>

        <span className="revenue-period">
          Last 8 months
        </span>
      </div>

      <div className="chart-area">
        <div className="chart-y-axis">
          <span>₹15L</span>
          <span>₹10L</span>
          <span>₹5L</span>
          <span>₹0</span>
        </div>

        <div className="chart-content">
          <div className="chart-grid-lines">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="chart-bars">
            {revenue.map((item) => (
              <div
                className="chart-bar-wrapper"
                key={item.month}
              >
                <div
                  className="chart-bar"
                  style={{
                    height: `${item.value}%`,
                  }}
                  title={`₹${item.value}L`}
                />

                <span>
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;