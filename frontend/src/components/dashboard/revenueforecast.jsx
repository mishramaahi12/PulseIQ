import {
  TrendingUp,
  Sparkles,
} from "lucide-react";

function RevenueForecast() {
  return (
    <div className="revenue-forecast-card">
      <div className="forecast-glow"></div>

      <div className="revenue-forecast-header">
        <div>
          <span className="chart-label">
            PRISM AI
          </span>

          <h2>Revenue Forecast</h2>

          <p>AI prediction for next month</p>
        </div>

        <div className="revenue-forecast-icon">
          <Sparkles size={21} />
        </div>
      </div>

      <div className="revenue-forecast-value">
        ₹13.8L
      </div>

      <div className="revenue-forecast-growth">
        <TrendingUp size={17} />

        <span>
          Expected +11% Growth
        </span>
      </div>

      <div className="forecast-progress">
        <span></span>
      </div>

      <div className="revenue-forecast-note">
        Based on the last 6 months' sales trend,
        PulseIQ predicts an estimated revenue of{" "}
        <strong>₹13.8L</strong> next month.
      </div>
    </div>
  );
}

export default RevenueForecast;