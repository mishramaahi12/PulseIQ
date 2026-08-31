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

function DashboardLayout() {
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

              <h1>
                Dashboard
              </h1>

              <p>
                Monitor your business performance and discover
                what needs your attention next.
              </p>
            </div>

            <div className="dashboard-heading-actions">

              <span className="demo-badge">
                LIVE DATA
              </span>

              <a
                href="/upload"
                className="upload-button"
              >
                Upload data
              </a>

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

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;