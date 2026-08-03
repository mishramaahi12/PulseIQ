function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-8">

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              PulseIQ
            </h2>

            <p className="text-gray-400 mt-3 max-w-md">
              AI-powered business intelligence platform that transforms
              your business data into smart decisions.
            </p>
          </div>

          <div className="flex gap-8 text-gray-400">

            <a href="#features" className="hover:text-white transition">
              Features
            </a>

            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>

            <a href="#about" className="hover:text-white transition">
              About
            </a>

            <a href="#contact" className="hover:text-white transition">
              Contact
            </a>

          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
          © 2026 PulseIQ. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;