import { useEffect, useState } from "react";

import {
  Bot,
  ArrowRight,
} from "lucide-react";

import AIChat from "./aichat";

import "./aiinsights.css";

function getInsight() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        description:
          "Upload or add business data to get personalized insights from your actual sales performance.",

        action:
          "Add your business data so Prism AI can identify your strongest opportunities.",
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

    const products = {};

    rows.forEach((row) => {
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

      products[product] =
        (products[product] || 0) +
        amount;
    });

    const topProduct =
      Object.entries(products).sort(
        (a, b) => b[1] - a[1]
      )[0];

    return {
      description:
        `Your current dataset contains ${rows.length} transactions, ` +
        `${customers} unique customers and ${formatCurrency(
          revenue
        )} in recorded revenue.`,

      action: topProduct
        ? `Focus on ${topProduct[0]}, currently your highest-revenue product.`
        : "Keep adding sales data to identify your strongest products.",
    };
  } catch {
    return {
      description:
        "Add business data to generate personalized insights.",

      action:
        "Upload your dataset or add transactions manually.",
    };
  }
}

function formatCurrency(value) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${Number(value).toLocaleString(
    "en-IN"
  )}`;
}

function AIInsights() {
  const [chatOpen, setChatOpen] =
    useState(false);

  const [insight, setInsight] =
    useState(getInsight());

  useEffect(() => {
    const updateInsight = () => {
      setInsight(getInsight());
    };

    window.addEventListener(
      "pulseiq-data-updated",
      updateInsight
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      updateInsight
    );

    window.addEventListener(
      "storage",
      updateInsight
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        updateInsight
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        updateInsight
      );

      window.removeEventListener(
        "storage",
        updateInsight
      );
    };
  }, []);

  return (
    <>
      <section className="dashboard-prism-card">

        <div className="dashboard-prism-header">
          <div className="dashboard-prism-icon">
            <Bot size={21} />
          </div>

          <div className="dashboard-prism-title">
            <span>PRISM AI</span>

            <h2>
              What deserves your attention?
            </h2>
          </div>
        </div>

        <p className="dashboard-prism-description">
          {insight.description}
        </p>

        <div className="dashboard-prism-action">
          <div className="dashboard-prism-action-title">
            <span className="action-dot" />

            <span>
              SUGGESTED ACTION
            </span>
          </div>

          <p>
            {insight.action}
          </p>
        </div>

        <button
          type="button"
          className="dashboard-prism-button"
          onClick={() =>
            setChatOpen(true)
          }
        >
          <Bot size={17} />

          <span>
            Ask Prism AI
          </span>

          <ArrowRight size={16} />
        </button>

      </section>

      {chatOpen && (
        <AIChat
          onClose={() =>
            setChatOpen(false)
          }
        />
      )}
    </>
  );
}

export default AIInsights;