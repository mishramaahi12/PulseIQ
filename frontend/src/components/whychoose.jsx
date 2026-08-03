function WhyChoose() {
  const benefits = [
    {
      title: "Save Time",
      description:
        "Automate repetitive reporting and spend more time making business decisions."
    },
    {
      title: "Increase Revenue",
      description:
        "AI-powered insights help identify opportunities to grow your business."
    },
    {
      title: "Simple to Use",
      description:
        "Upload your data and start analyzing within minutes—no technical skills required."
    }
  ];

  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center text-gray-900">
          Why Choose PulseIQ?
        </h2>

        <p className="text-center text-gray-500 mt-5 max-w-3xl mx-auto">
          PulseIQ combines AI, analytics and an intuitive dashboard to help
          businesses make smarter decisions faster.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {benefits.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                {index + 1}
              </div>

              <h3 className="text-2xl font-bold mt-6">
                {item.title}
              </h3>

              <p className="text-gray-500 mt-4 leading-7">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default WhyChoose;