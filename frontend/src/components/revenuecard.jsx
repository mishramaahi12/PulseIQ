function RevenueCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            ₹12.4L
          </h2>
        </div>

        <div className="bg-green-100 text-green-600 px-3 py-2 rounded-xl font-semibold">
          +18%
        </div>
      </div>
    </div>
  );
}

export default RevenueCard;