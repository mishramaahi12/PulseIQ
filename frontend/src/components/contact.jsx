function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">

        <div className="text-center mb-16">

          <p className="text-blue-600 font-semibold uppercase tracking-[4px]">
            Contact
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-4">
            Let's Build Something Great
          </h2>

          <p className="text-slate-500 mt-5 max-w-2xl mx-auto">
            Have a question, partnership idea, or want a demo?
            We'd love to hear from you.
          </p>

        </div>

        <div className="bg-slate-50 rounded-3xl p-10 shadow-sm border border-slate-200">

          <div className="grid md:grid-cols-2 gap-8">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
            />

          </div>

          <input
            type="text"
            placeholder="Company Name"
            className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:border-blue-500 mt-6"
          />

          <textarea
            rows="6"
            placeholder="Tell us about your project..."
            className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:border-blue-500 mt-6 resize-none"
          ></textarea>

          <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
            Send Message
          </button>

        </div>

      </div>
    </section>
  );
}

export default Contact;