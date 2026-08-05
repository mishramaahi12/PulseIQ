import RevenueCard from "./revenuecard";
import SalesChart from "./saleschart";
import PrismAICard from "./prismaicard";
import KpiCard from "./kpicard";

function DashboardPreview() {
  return (
    <div className="w-[450px] space-y-5">

      {/* Revenue Card */}
      <RevenueCard />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">

        <KpiCard
          title="Customers"
          value="2.8K"
          growth="12"
        />

        <KpiCard
          title="Orders"
          value="1.4K"
          growth="18"
        />

      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 gap-4">

        <SalesChart />

        <PrismAICard />

      </div>

    </div>
  );
}

export default DashboardPreview;