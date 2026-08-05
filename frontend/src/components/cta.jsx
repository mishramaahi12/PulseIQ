function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white shadow-2xl">

          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Grow Your Business?
          </h2>

          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-8">
            Join hundreds of businesses using PulseIQ to make smarter,
            data-driven decisions with AI-powered analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:scale-105 transition">
              Start Free Trial
            </button>

            <button className="border border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition">
              Book a Demo
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CTA;