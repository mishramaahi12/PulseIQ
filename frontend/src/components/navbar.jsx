import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Pulse<span>IQ</span>
        </Link>

        {/* NAV LINKS */}
        <div className={`navbar-links ${menuOpen ? "mobile-open" : ""}`}>
          <a href="/#features" onClick={closeMenu}>
            Features
          </a>

          <a href="/#about" onClick={closeMenu}>
            About
          </a>

          <a href="/#why" onClick={closeMenu}>
            Why PulseIQ
          </a>

          <a href="/#pricing" onClick={closeMenu}>
            Pricing
          </a>

          <a href="/#contact" onClick={closeMenu}>
            Contact
          </a>
        </div>

        {/* ACTIONS */}
        <div
          className={`navbar-actions ${
            menuOpen ? "mobile-actions-open" : ""
          }`}
        >
          <Link
            to="/login"
            className="navbar-login"
            onClick={closeMenu}
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="navbar-signup"
            onClick={closeMenu}
          >
            Get started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`navbar-menu-button ${
            menuOpen ? "menu-open" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  );
}

export default Navbar;