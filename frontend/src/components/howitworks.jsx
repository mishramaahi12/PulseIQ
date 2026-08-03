function HowItWorks() {
  const steps = [
    {
      icon: "📁",
      title: "Upload CSV",
      description: "Upload your sales, customer or inventory data in seconds."
    },
    {
      icon: "🧠",
      title: "PRISM AI Analysis",
      description: "Our AI cleans, analyzes and understands your business data."
    },
    {
      icon: "📊",
      title: "Smart Dashboard",
      description: "Interactive charts and KPIs are generated automatically."
    },
    {
      icon: "💡",
      title: "AI Recommendations",
      description: "Receive personalized suggestions to improve your business."
    }
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center text-gray-900">
          How PRISM AI Works
        </h2>

        <p className="text-center text-gray-500 mt-5 max-w-3xl mx-auto">
          Transform raw business data into intelligent insights in just four simple steps.
        </p>

        <div className="grid md:grid-cols-4 gap-8 mt-20">

          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl border border-gray-200 p-8 shadow-lg transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                {step.icon}
              </div>

              <h3 className="text-2xl font-bold text-center mt-6">
                {step.title}
              </h3>

              <p className="text-gray-500 text-center mt-4 leading-7">
                {step.description}
              </p>

              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute top-16 -right-6 text-3xl text-blue-500">
                  →
                </div>
              )}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;