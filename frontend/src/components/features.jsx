function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI Insights",
      description:
        "Get intelligent business recommendations powered by AI."
    },
    {
      icon: "📊",
      title: "Interactive Dashboards",
      description:
        "Monitor sales, revenue, and customers with beautiful dashboards."
    },
    {
      icon: "📁",
      title: "CSV Upload",
      description:
        "Upload your business data in seconds and start analyzing."
    },
    {
      icon: "📈",
      title: "Predictive Analytics",
      description:
        "Forecast trends and make smarter business decisions."
    },
    {
      icon: "🔒",
      title: "Secure Data",
      description:
        "Enterprise-grade security to keep your business data safe."
    },
    {
      icon: "☁️",
      title: "Cloud Access",
      description:
        "Access your analytics dashboard anytime from anywhere."
    }
  ];

  return (
    <section id="features" className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center text-gray-900">
          Powerful Features
        </h2>

        <p className="text-center text-gray-500 mt-5 max-w-2xl mx-auto">
          Everything you need to analyze, visualize and grow your business using AI.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-5xl">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold mt-6">
                {feature.title}
              </h3>

              <p className="text-gray-500 mt-4 leading-7">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;