import { TrendingUp } from "lucide-react";

function SalesChart() {
  const bars = [45, 62, 52, 78, 68, 91, 76];

  return (
    <div className="sales-chart-card">
      <div className="sales-chart-header">
        <div>
          <span className="chart-label">SALES</span>

          <h2>₹8.2L</h2>

          <p>Monthly sales performance</p>
        </div>

        <div className="sales-growth">
          <TrendingUp size={15} />
          +24%
        </div>
      </div>

      <div className="sales-bars">
        {bars.map((height, index) => (
          <div
            className="sales-bar-wrapper"
            key={index}
          >
            <div
              className="sales-bar"
              style={{ height: `${height}%` }}
            ></div>

            <span>
              {
                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
                  index
                ]
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesChart;