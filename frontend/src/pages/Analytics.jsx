import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";
import RevenueChart from "../components/dashboard/revenuechart";

function Analytics() {
  const stats = [
    {
      title: "Revenue",
      value: "₹12.4L",
      growth: "+18%",
    },
    {
      title: "Orders",
      value: "2,486",
      growth: "+12%",
    },
    {
      title: "Growth",
      value: "32%",
      growth: "+5%",
    },
  ];

  return (
    <div className="dashboard-shell">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="dashboard-content">

          <div className="page-heading">
            <div>
              <span className="eyebrow">
                PERFORMANCE
              </span>

              <h1>Analytics</h1>

              <p>
                Understand your revenue, customers and
                business growth.
              </p>
            </div>
          </div>

          <div className="stats-grid">

            {stats.map((item) => (
              <div
                key={item.title}
                className="stat-card hover-lift"
              >
                <div className="stat-top">
                  <span className="stat-change">
                    {item.growth}
                  </span>
                </div>

                <p>{item.title}</p>

                <h2>{item.value}</h2>
              </div>
            ))}

          </div>

          <div
            className="dashboard-card"
            style={{ marginTop: "20px" }}
          >
            <RevenueChart />
          </div>

        </main>

      </div>
    </div>
  );
}

export default Analytics;