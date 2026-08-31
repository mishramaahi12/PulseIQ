import { useState } from "react";
import { Bot, ArrowRight } from "lucide-react";
import AIChat from "./aichat";
import "./aiinsights.css";

function AIInsights() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <section className="dashboard-prism-card">

        {/* HEADER */}
        <div className="dashboard-prism-header">
          <div className="dashboard-prism-icon">
            <Bot size={21} />
          </div>

          <div className="dashboard-prism-title">
            <span>PRISM AI</span>
            <h2>What deserves your attention?</h2>
          </div>
        </div>

        {/* INSIGHT */}
        <p className="dashboard-prism-description">
          Revenue is trending upward while repeat customers
          are becoming a stronger part of your sales mix.
        </p>

        {/* SUGGESTED ACTION */}
        <div className="dashboard-prism-action">
          <div className="dashboard-prism-action-title">
            <span className="action-dot"></span>
            <span>SUGGESTED ACTION</span>
          </div>

          <p>
            Focus on retention offers for your most active
            customers.
          </p>
        </div>

        {/* BUTTON */}
        <button
          type="button"
          className="dashboard-prism-button"
          onClick={() => setChatOpen(true)}
        >
          <Bot size={17} />
          <span>Ask Prism AI</span>
          <ArrowRight size={16} />
        </button>

      </section>

      {/* CHAT */}
      {chatOpen && (
        <AIChat
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}

export default AIInsights;