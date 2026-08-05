function Testimonials() {
  const reviews = [
    {
      name: "Rahul Sharma",
      role: "Founder • UrbanKart",
      review:
        "PulseIQ simplified our reporting process. We now spend less time analyzing data and more time making confident business decisions."
    },
    {
      name: "Priya Patel",
      role: "Operations Manager • NexRetail",
      review:
        "The dashboard is incredibly easy to use. PRISM AI helped us identify customer trends that we had completely overlooked."
    },
    {
      name: "Arjun Mehta",
      role: "Business Consultant",
      review:
        "Instead of spending hours creating reports, PulseIQ gives us meaningful insights within minutes. It has become part of our daily workflow."
    }
  ];

  return (
    <section className="py-24 bg-slate-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="text-center">

          <p className="text-blue-600 font-semibold uppercase tracking-[4px]">
            Testimonials
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-4">
            Trusted by Growing Businesses
          </h2>

          <p className="text-slate-500 mt-5 max-w-2xl mx-auto text-lg leading-8">
            Businesses rely on PulseIQ every day to make smarter,
            data-driven decisions with confidence.
          </p>

        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {reviews.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300"
            >

              {/* Profile */}
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {item.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.role}
                  </p>
                </div>

              </div>

              {/* Review */}
              <p className="text-slate-600 leading-8 mt-6">
                "{item.review}"
              </p>

              {/* Stars */}
              <div className="flex gap-1 text-amber-400 text-lg mt-8">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;