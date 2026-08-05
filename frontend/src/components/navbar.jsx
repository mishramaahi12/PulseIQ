import { BrainCircuit } from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <BrainCircuit size={24} className="text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              PulseIQ
            </h1>
            <p className="text-xs text-gray-500 -mt-1">
              Business Intelligence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <a href="#features" className="hover:text-blue-600 transition">
            Features
          </a>

          <a href="#pricing" className="hover:text-blue-600 transition">
            Pricing
          </a>

          <a href="#about" className="hover:text-blue-600 transition">
            About
          </a>

          <a href="#contact" className="hover:text-blue-600 transition">
            Contact
          </a>
        </div>

        {/* Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition">
          Get Started
        </button>

      </div>
    </nav>
  );
}

export default Navbar;