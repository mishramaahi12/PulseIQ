import RevenueCard from "./revenuecard";
import SalesChart from "./saleschart";
import PrismAICard from "./prismaicard";

function DashboardPreview() {
  return (
    <div className="w-[430px] space-y-5 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">

      <RevenueCard />

      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-1">
          <SalesChart />
        </div>

        <div className="col-span-1">
          <PrismAICard />
        </div>

      </div>

    </div>
  );
}

export default DashboardPreview;