import { TrendingUp } from "lucide-react";

function KpiCard({ title, value, growth }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-start">

        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {value}
          </h2>

          <p className="text-green-600 text-sm mt-2">
            +{growth}% this month
          </p>
        </div>

        <div className="bg-green-100 p-3 rounded-xl">
          <TrendingUp className="text-green-600" size={22} />
        </div>

      </div>
    </div>
  );
}

export default KpiCard;