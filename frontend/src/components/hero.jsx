import DashboardPreview from "./dashboardpreview";

function Hero() {
  return (
    <section className="bg-slate-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <div>

          <p className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            AI BUSINESS INTELLIGENCE PLATFORM
          </p>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mt-6">
            Transform Business Data
            <br />
            Into Smarter Decisions
          </h1>

          <p className="text-gray-600 text-lg leading-8 mt-8 max-w-xl">
            PulseIQ empowers businesses with AI-powered analytics,
            real-time dashboards, predictive insights, and smart
            reporting to make faster and better business decisions.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4 mt-10">

            <button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white px-8 py-4 rounded-xl font-semibold shadow-lg">
              Get Started
            </button>

            <button className="border border-gray-300 hover:bg-white transition-all duration-300 px-8 py-4 rounded-xl font-semibold">
              Live Demo
            </button>

          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-600">

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              AI Powered Insights
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Real-Time Analytics
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Secure Cloud Platform
            </div>

          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-10 mt-12">

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                10K+
              </h2>
              <p className="text-gray-500 mt-1">
                Reports Generated
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                500+
              </h2>
              <p className="text-gray-500 mt-1">
                Businesses
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                98%
              </h2>
              <p className="text-gray-500 mt-1">
                Prediction Accuracy
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center lg:justify-end">
          <DashboardPreview />
        </div>

      </div>
    </section>
  );
}

export default Hero;