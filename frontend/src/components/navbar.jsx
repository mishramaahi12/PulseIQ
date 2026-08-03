function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

        {/* Logo */}
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PulseIQ
        </h1>

        {/* Navigation */}
        <div className="hidden md:flex gap-8 text-gray-600 font-medium">

          <a
            href="#features"
            className="hover:text-blue-600 transition-colors"
          >
            Features
          </a>

          <a
            href="#pricing"
            className="hover:text-blue-600 transition-colors"
          >
            Pricing
          </a>

          <a
            href="#about"
            className="hover:text-blue-600 transition-colors"
          >
            About
          </a>

          <a
            href="#contact"
            className="hover:text-blue-600 transition-colors"
          >
            Contact
          </a>

        </div>

        {/* Button */}
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
          Get Started
        </button>

      </div>
    </nav>
  );
}

export default Navbar;