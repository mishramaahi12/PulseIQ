import { useState } from "react";

import {
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import AIChat from "./aichat";

import Sidebar from "./sidebar";
import Topbar from "./topbar";
import "./prismai.css";

function PrismAI() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}
      <Sidebar />

      <div className="dashboard-main">

        {/* TOPBAR */}
        <Topbar />

        <main className="dashboard-content">

          <section className="prism-page">

            {/* HEADER */}

            <div className="prism-page-header">

              <div className="prism-page-badge">
                <Sparkles size={15} />
                <span>PRISM AI</span>
              </div>

              <h1>What deserves your attention?</h1>

              <p>
                Turn your business data into clear insights,
                trends and decisions with Prism AI.
              </p>

            </div>


            {/* AI INSIGHT */}

            <div className="prism-insight-card">

              <div className="prism-insight-icon">
                <Bot size={22} />
              </div>

              <div className="prism-insight-content">

                <span className="prism-insight-label">
                  AI INSIGHT
                </span>

                <h3>
                  Your business performance is showing positive momentum.
                </h3>

                <p>
                  Prism AI can analyze your revenue, sales,
                  customers and products using your selected data source.
                </p>

              </div>

            </div>


            {/* SUGGESTED ACTION */}

            <div className="prism-action-card">

              <div className="prism-action-top">

                <span className="prism-action-dot"></span>

                <span className="prism-action-label">
                  SUGGESTED ACTION
                </span>

              </div>

              <p>
                Ask Prism AI to identify the most important
                opportunity in your business data.
              </p>

            </div>


            {/* CHAT CARD */}

            <div className="prism-conversation-card">

              <div className="prism-conversation-text">

                <div className="prism-conversation-icon">
                  <Bot size={20} />
                </div>

                <div>

                  <h3>Start a conversation</h3>

                  <p>
                    Ask Prism AI about revenue, profit,
                    customers, products or business performance.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="prism-conversation-button"
                onClick={() => setChatOpen(true)}
              >
                <span>Ask Prism AI</span>
                <ArrowRight size={17} />
              </button>

            </div>

          </section>

        </main>

      </div>


      {/* PRISM AI CHAT */}

      {chatOpen && (
        <AIChat
          onClose={() => setChatOpen(false)}
        />
      )}

    </div>
  );
}

export default PrismAI;