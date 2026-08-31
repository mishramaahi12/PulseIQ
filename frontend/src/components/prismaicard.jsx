import { Bot, ArrowRight } from "lucide-react";

function PrismAICard({ onAsk }) {
  return (
    <div className="prism-dashboard-card">

      <div className="prism-dashboard-header">
        <div className="prism-ai-icon">
          <Bot size={21} />
        </div>

        <div>
          <span className="prism-dashboard-label">
            PRISM AI
          </span>

          <h3>Smart Business Assistant</h3>
        </div>
      </div>

      <div className="prism-dashboard-insight">
        <p>
          Revenue is trending upward while repeat
          customers are becoming a stronger part of
          your sales mix.
        </p>

        <div className="prism-insight-footer">
          <span>AI confidence</span>
          <strong>94%</strong>
        </div>
      </div>

      <button
        type="button"
        className="prism-dashboard-button"
        onClick={onAsk}
      >
        <span>Ask Prism AI</span>
        <ArrowRight size={17} />
      </button>

    </div>
  );
}

export default PrismAICard;