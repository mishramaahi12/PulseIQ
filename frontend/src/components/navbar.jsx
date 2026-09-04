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
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          Pulse<span>IQ</span>
        </Link>

        {/* NAV LINKS */}
        <div
          className={`navbar-links ${
            menuOpen ? "mobile-open" : ""
          }`}
        >

          <Link to="/features" onClick={closeMenu}>
            Features
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About
          </Link>

          <Link to="/why" onClick={closeMenu}>
            Why PulseIQ
          </Link>

          <Link to="/pricing" onClick={closeMenu}>
            Pricing
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>

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