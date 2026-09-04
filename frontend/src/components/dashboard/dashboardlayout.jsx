import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Sparkles,
  TrendingUp,
  Upload,
  WalletCards,
  Zap,
} from "lucide-react";

import Sidebar from "./sidebar";
import Topbar from "./topbar";
import DataNotice from "./datanotice";
import StatsCards from "./statscards";
import RevenueChart from "./revenuechart";
import AIInsights from "./aiinsights";
import RecentActivity from "./recentactivity";
import TopProducts from "./topproducts";
import BusinessHealth from "./businesshealth";
import RevenueForecast from "./revenueforecast";

import "../../pages/dashboard.css";

function DashboardLayout() {
  const [hasData, setHasData] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const checkData = () => {
      try {
        const data = JSON.parse(
          localStorage.getItem("pulseiq_business_data") || "[]"
        );

        const valid = Array.isArray(data) && data.length > 0;

        setHasData(valid);
        setRowCount(valid ? data.length : 0);
      } catch {
        setHasData(false);
        setRowCount(0);
      }
    };

    checkData();

    window.addEventListener("pulseiq-data-updated", checkData);
    window.addEventListener("pulseiq-dataset-updated", checkData);
    window.addEventListener("storage", checkData);

    return () => {
      window.removeEventListener("pulseiq-data-updated", checkData);
      window.removeEventListener("pulseiq-dataset-updated", checkData);
      window.removeEventListener("storage", checkData);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content dashboard-command-center">

          {/* =====================================================
              COMMAND CENTER HERO
          ====================================================== */}

          <section className="dashboard-hero">

            <div className="dashboard-hero-left">

              <div className="dashboard-status-row">
                <span className="dashboard-live-dot"></span>

                <span className="dashboard-status-text">
                  BUSINESS COMMAND CENTER
                </span>

                <span className="dashboard-status-divider"></span>

                <span className="dashboard-status-date">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1>
                {getGreeting()}, welcome back.
              </h1>

              <p>
                Get a clear view of your business performance,
                spot important changes, and decide what to do next.
              </p>

              <div className="dashboard-hero-actions">

                <button
                  className="dashboard-primary-action"
                  onClick={() => {
                    window.location.href = "/upload";
                  }}
                >
                  <Upload size={17} />
                  Upload Data
                  <ArrowUpRight size={16} />
                </button>

                <div className="dashboard-data-state">
                  <div className="dashboard-data-icon">
                    <Database size={17} />
                  </div>

                  <div>
                    <strong>
                      {hasData ? "Live business data" : "Demo workspace"}
                    </strong>

                    <span>
                      {hasData
                        ? `${rowCount.toLocaleString("en-IN")} records connected`
                        : "Upload data to activate insights"}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            <div className="dashboard-hero-right">

              <div className="dashboard-orbit dashboard-orbit-one"></div>
              <div className="dashboard-orbit dashboard-orbit-two"></div>

              <div className="dashboard-command-card">

                <div className="command-card-top">
                  <div className="command-card-icon">
                    <Sparkles size={21} />
                  </div>

                  <span>PulseIQ Intelligence</span>
                </div>

                <div className="command-card-title">
                  Your business at a glance
                </div>

                <div className="command-mini-stats">

                  <div>
                    <span>STATUS</span>
                    <strong>
                      {hasData ? "Active" : "Ready"}
                    </strong>
                  </div>

                  <div>
                    <span>DATA</span>
                    <strong>
                      {hasData ? "Connected" : "Demo"}
                    </strong>
                  </div>

                </div>

                <div className="command-card-footer">
                  <Zap size={14} />
                  AI-powered business monitoring
                </div>

              </div>

            </div>

          </section>


          {/* =====================================================
              DATA NOTICE
          ====================================================== */}

          <DataNotice />


          {/* =====================================================
              SNAPSHOT TITLE
          ====================================================== */}

          <section className="dashboard-section-heading">

            <div>
              <span className="dashboard-section-kicker">
                TODAY AT A GLANCE
              </span>

              <h2>
                Business snapshot
              </h2>

              <p>
                The numbers that matter most right now.
              </p>
            </div>

            <div className="dashboard-section-live">
              <span></span>
              Updating automatically
            </div>

          </section>


          {/* =====================================================
              KPI CARDS
          ====================================================== */}

          <section className="dashboard-kpi-wrapper">
            <StatsCards />
          </section>


          {/* =====================================================
              MAIN INTELLIGENCE AREA
          ====================================================== */}

          <section className="dashboard-main-grid">

            <div className="dashboard-revenue-panel">

              <div className="dashboard-panel-heading">

                <div>
                  <span className="dashboard-panel-label">
                    PERFORMANCE
                  </span>

                  <h2>
                    Revenue momentum
                  </h2>

                  <p>
                    Track how your business is moving over time.
                  </p>
                </div>

                <div className="dashboard-panel-icon revenue-panel-icon">
                  <TrendingUp size={19} />
                </div>

              </div>

              <div className="dashboard-chart-container">
                <RevenueChart />
              </div>

            </div>


            {/* ACTION CENTER */}

            <div className="dashboard-action-panel">

              <div className="dashboard-panel-heading">

                <div>
                  <span className="dashboard-panel-label">
                    NEXT MOVES
                  </span>

                  <h2>
                    Action center
                  </h2>

                  <p>
                    Areas worth checking today.
                  </p>
                </div>

                <div className="dashboard-panel-icon action-panel-icon">
                  <Bell size={18} />
                </div>

              </div>

              <div className="dashboard-action-list">

                <div className="dashboard-action-item">

                  <div className="action-item-icon action-blue">
                    <TrendingUp size={17} />
                  </div>

                  <div className="action-item-content">
                    <strong>
                      Monitor revenue
                    </strong>

                    <span>
                      Review your latest revenue movement.
                    </span>
                  </div>

                  <ArrowUpRight size={16} />

                </div>


                <div className="dashboard-action-item">

                  <div className="action-item-icon action-orange">
                    <Clock3 size={17} />
                  </div>

                  <div className="action-item-content">
                    <strong>
                      Check pending payments
                    </strong>

                    <span>
                      Keep your collection cycle healthy.
                    </span>
                  </div>

                  <ArrowUpRight size={16} />

                </div>


                <div className="dashboard-action-item">

                  <div className="action-item-icon action-green">
                    <WalletCards size={17} />
                  </div>

                  <div className="action-item-content">
                    <strong>
                      Review customer activity
                    </strong>

                    <span>
                      Identify customers driving your business.
                    </span>
                  </div>

                  <ArrowUpRight size={16} />

                </div>


                <div className="dashboard-action-item">

                  <div className="action-item-icon action-purple">
                    <Sparkles size={17} />
                  </div>

                  <div className="action-item-content">
                    <strong>
                      Ask PRISM AI
                    </strong>

                    <span>
                      Get an AI-powered business explanation.
                    </span>
                  </div>

                  <ArrowUpRight size={16} />

                </div>

              </div>

              <button
                className="dashboard-ai-button"
                onClick={() => {
                  window.location.href = "/prismai";
                }}
              >
                <Sparkles size={16} />
                Open PRISM AI
                <ArrowUpRight size={15} />
              </button>

            </div>

          </section>


          {/* =====================================================
              AI INSIGHTS
          ====================================================== */}

          <section className="dashboard-ai-section">

            <div className="dashboard-section-heading compact">

              <div>
                <span className="dashboard-section-kicker">
                  INTELLIGENCE LAYER
                </span>

                <h2>
                  What PulseIQ sees
                </h2>

                <p>
                  Automated signals generated from your business data.
                </p>
              </div>

            </div>

            <div className="dashboard-ai-card-wrapper">
              <AIInsights />
            </div>

          </section>


          {/* =====================================================
              PRODUCTS + ACTIVITY
          ====================================================== */}

          <section className="dashboard-section-heading compact">

            <div>
              <span className="dashboard-section-kicker">
                BUSINESS ACTIVITY
              </span>

              <h2>
                What's happening
              </h2>

              <p>
                Products and customer activity across your business.
              </p>
            </div>

          </section>


          <section className="dashboard-grid dashboard-activity-grid">

            <div className="dashboard-enhanced-card">
              <RecentActivity />
            </div>

            <div className="dashboard-enhanced-card">
              <TopProducts />
            </div>

          </section>


          {/* =====================================================
              HEALTH + FORECAST
          ====================================================== */}

          <section className="dashboard-grid dashboard-strategy-grid">

            <div className="dashboard-enhanced-card">
              <BusinessHealth />
            </div>

            <div className="dashboard-enhanced-card">
              <RevenueForecast />
            </div>

          </section>


          {/* =====================================================
              BOTTOM CTA
          ====================================================== */}

          <section className="dashboard-bottom-cta">

            <div className="dashboard-bottom-icon">
              <CheckCircle2 size={22} />
            </div>

            <div className="dashboard-bottom-text">
              <span>
                PULSEIQ WORKSPACE
              </span>

              <strong>
                Keep your business decisions data-driven.
              </strong>

              <p>
                Upload fresh data regularly to keep your dashboard,
                analytics and insights accurate.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = "/analytics";
              }}
            >
              Explore Analytics
              <ArrowUpRight size={16} />
            </button>

          </section>


          <div className="dashboard-footer-note">
            PulseIQ • Business Intelligence for Smarter Decisions
          </div>

        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;