function PrismAICard() {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 h-72 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-200 flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 group-hover:rotate-12">
          AI
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            PRISM AI
          </h3>

          <p className="text-sm text-gray-500">
            Smart Business Assistant
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-gray-700 leading-7">
          📈 Sales are predicted to grow by{" "}
          <span className="font-bold text-green-600">
            12%
          </span>{" "}
          over the next week based on recent trends.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Confidence
          </span>

          <span className="font-semibold text-green-600">
            94%
          </span>
        </div>
      </div>

      {/* CTA */}
      <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold transition-all duration-300 hover:scale-105">
        View Insights →
      </button>

    </div>
  );
}

export default PrismAICard;