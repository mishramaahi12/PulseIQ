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
  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">

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
                DEMO DATA
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

          <DataNotice />

          <StatsCards />

          <div className="dashboard-grid dashboard-grid-large">
            <div className="dashboard-card">
              <RevenueChart />
            </div>

            <AIInsights />
          </div>

          <div className="dashboard-grid">
            <RecentActivity />
            <TopProducts />
          </div>

          <div className="dashboard-grid">
            <BusinessHealth />
            <RevenueForecast />
          </div>

          {/* PRISM AI */}
          <div id="prism" className="dashboard-grid">
            <PrismAI />
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;