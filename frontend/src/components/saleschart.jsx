function SalesChart() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 h-72 shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.03]">
      <div className="flex justify-between text-white">
        <div>
          <p className="text-sm opacity-80">Sales</p>
          <h2 className="text-3xl font-bold">₹8.2L</h2>
        </div>

        <div className="bg-white/20 px-3 py-2 rounded-xl">
          +24%
        </div>
      </div>

      <div className="absolute bottom-8 left-6 right-6 flex items-end gap-3">

        <div className="h-16 w-6 rounded bg-white/70"></div>
        <div className="h-24 w-6 rounded bg-white/70"></div>
        <div className="h-20 w-6 rounded bg-white/70"></div>
        <div className="h-32 w-6 rounded bg-white"></div>
        <div className="h-28 w-6 rounded bg-white/70"></div>
        <div className="h-40 w-6 rounded bg-white"></div>

      </div>

    </div>
  );
}

export default SalesChart;