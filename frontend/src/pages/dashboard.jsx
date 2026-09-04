import { useEffect, useState } from "react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";
import DataNotice from "../components/dashboard/datanotice";
import StatsCards from "../components/dashboard/statscards";
import RevenueChart from "../components/dashboard/revenuechart";
import AIInsights from "../components/dashboard/aiinsights";
import RecentActivity from "../components/dashboard/recentactivity";
import TopProducts from "../components/dashboard/topproducts";
import BusinessHealth from "../components/dashboard/businesshealth";
import RevenueForecast from "../components/dashboard/revenueforecast";
import PrismAI from "../components/dashboard/prismai";

function Dashboard() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const checkData = () => {
      try {
        const data = JSON.parse(
          localStorage.getItem("pulseiq_business_data") || "[]"
        );

        setHasData(Array.isArray(data) && data.length > 0);
      } catch {
        setHasData(false);
      }
    };

    checkData();

    window.addEventListener(
      "pulseiq-data-updated",
      checkData
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      checkData
    );

    window.addEventListener(
      "storage",
      checkData
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        checkData
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        checkData
      );

      window.removeEventListener(
        "storage",
        checkData
      );
    };
  }, []);

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">

          {/* PAGE HEADING */}
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                BUSINESS OVERVIEW
              </span>

              <h1>Dashboard</h1>

              <p>
                Monitor your business performance and discover
                what needs your attention next.
              </p>
            </div>

            <div className="dashboard-heading-actions">
              <span className="demo-badge">
                {hasData ? "LIVE DATA" : "DEMO DATA"}
              </span>

              <button
                className="upload-button"
                onClick={() => {
                  window.location.href = "/upload";
                }}
              >
                Upload Data
              </button>
            </div>
          </div>

          {/* DATA NOTICE */}
          <DataNotice />

          {/* KPI STATS */}
          <StatsCards />

          {/* REVENUE + AI */}
          <div className="dashboard-grid dashboard-grid-large">
            <div className="dashboard-card">
              <RevenueChart />
            </div>

            <AIInsights />
          </div>

          {/* ACTIVITY + PRODUCTS */}
          <div className="dashboard-grid">
            <RecentActivity />
            <TopProducts />
          </div>

          {/* HEALTH + FORECAST */}
          <div className="dashboard-grid">
            <BusinessHealth />
            <RevenueForecast />
          </div>

          {/* PRISM AI */}
          <div
            id="prism"
            className="dashboard-grid"
          >
            <PrismAI />
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;