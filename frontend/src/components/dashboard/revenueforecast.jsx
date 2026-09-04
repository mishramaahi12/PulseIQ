import {
  TrendingUp,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

function formatINR(value) {
  const number = Number(value) || 0;

  if (number >= 10000000) {
    return `${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toLocaleString(
    "en-IN"
  );
}

function calculateForecast() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        value: 0,
        growth: 0,
        hasData: false,
      };
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

    if (revenue <= 0) {
      return {
        value: 0,
        growth: 0,
        hasData: false,
      };
    }

    const average =
      revenue / Math.max(rows.length, 1);

    const forecast =
      revenue +
      average * Math.min(rows.length, 10);

    return {
      value: forecast,
      growth: 10,
      hasData: true,
    };
  } catch {
    return {
      value: 0,
      growth: 0,
      hasData: false,
    };
  }
}

function RevenueForecast() {
  const [forecast, setForecast] =
    useState(calculateForecast());

  useEffect(() => {
    const update = () => {
      setForecast(
        calculateForecast()
      );
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
    <div className="revenue-forecast-card">

      <div className="forecast-glow" />

      <div className="revenue-forecast-header">
        <div>
          <span className="chart-label">
            PRISM AI
          </span>

          <h2>
            Revenue Forecast
          </h2>

          <p>
            AI prediction for next month
          </p>
        </div>

        <div className="revenue-forecast-icon">
          <Sparkles size={21} />
        </div>
      </div>

      <div className="revenue-forecast-value">
        ₹
        {forecast.hasData
          ? formatINR(forecast.value)
          : "0"}
      </div>

      <div className="revenue-forecast-growth">
        <TrendingUp size={17} />

        <span>
          {forecast.hasData
            ? `Expected +${forecast.growth}% Growth`
            : "Waiting for business data"}
        </span>
      </div>

      <div className="forecast-progress">
        <span
          style={{
            width: `${Math.min(
              Math.max(
                forecast.growth * 5,
                10
              ),
              100
            )}%`,
          }}
        />
      </div>

      <div className="revenue-forecast-note">
        {forecast.hasData ? (
          <>
            Based on your current sales data,
            PulseIQ predicts an estimated revenue
            of{" "}
            <strong>
              ₹{formatINR(
                forecast.value
              )}
            </strong>{" "}
            next month.
          </>
        ) : (
          <>
            Add or upload business data to
            generate a personalized revenue
            forecast.
          </>
        )}
      </div>

    </div>
  );
}

export default RevenueForecast;