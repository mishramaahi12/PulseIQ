function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center text-gray-900">
          Simple Pricing
        </h2>

        <p className="text-center text-gray-500 mt-5 max-w-2xl mx-auto">
          Start free and upgrade as your business grows.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {/* Free Plan */}

          <div className="group bg-white rounded-3xl p-8 border border-gray-200 shadow-lg transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl">

            <h3 className="text-2xl font-bold">
              Free
            </h3>

            <p className="text-5xl font-bold mt-6">
              ₹0
            </p>

            <p className="text-gray-500 mt-2">
              Forever Free
            </p>

            <ul className="mt-8 space-y-4 text-gray-600">
              <li>✅ Dashboard Access</li>
              <li>✅ CSV Upload</li>
              <li>✅ Basic Analytics</li>
              <li>❌ AI Insights</li>
            </ul>

            <button className="w-full mt-10 py-3 rounded-xl bg-gray-900 text-white transition-transform duration-300 group-hover:scale-105">
              Get Started
            </button>

          </div>

          {/* PRO */}

          <div className="group bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl scale-[1.02] transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl">

            <span className="inline-block bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              Most Popular
            </span>

            <h3 className="text-2xl font-bold mt-6">
              Pro
            </h3>

            <p className="text-5xl font-bold mt-6">
              ₹499
              <span className="text-lg font-normal">
                /month
              </span>
            </p>

            <ul className="mt-8 space-y-4">
              <li>✅ Unlimited Dashboards</li>
              <li>✅ AI Insights</li>
              <li>✅ Predictive Analytics</li>
              <li>✅ Email Reports</li>
            </ul>

            <button className="w-full mt-10 py-3 rounded-xl bg-white text-blue-600 font-bold transition-transform duration-300 group-hover:scale-105">
              Start Free Trial
            </button>

          </div>

          {/* Enterprise */}

          <div className="group bg-white rounded-3xl p-8 border border-gray-200 shadow-lg transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl">

            <h3 className="text-2xl font-bold">
              Enterprise
            </h3>

            <p className="text-5xl font-bold mt-6">
              Custom
            </p>

            <p className="text-gray-500 mt-2">
              Contact Sales
            </p>

            <ul className="mt-8 space-y-4 text-gray-600">
              <li>✅ Unlimited Users</li>
              <li>✅ Dedicated Support</li>
              <li>✅ API Access</li>
              <li>✅ Custom AI Models</li>
            </ul>

            <button className="w-full mt-10 py-3 rounded-xl bg-gray-900 text-white transition-transform duration-300 group-hover:scale-105">
              Contact Us
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Pricing;