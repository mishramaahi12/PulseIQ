import DashboardPreview from "./dashboardpreview";

function Hero() {
  return (
    <section className="min-h-[85vh] bg-slate-50 px-10 py-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <div>
          <p className="text-blue-600 font-semibold uppercase tracking-widest">
            AI Business Intelligence Platform
          </p>

          <h1 className="text-6xl font-extrabold text-gray-900 mt-4 leading-tight">
            Transform Business Data Into Smarter Decisions
          </h1>

          <p className="text-lg text-gray-600 mt-6">
            PulseIQ helps businesses analyze sales, customers, inventory, and
            performance with AI-powered insights and beautiful dashboards.
          </p>

          <div className="flex gap-4 mt-10">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
              Get Started
            </button>

            <button className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100">
              Live Demo
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          <DashboardPreview />
        </div>

      </div>
    </section>
  );
}

export default Hero;