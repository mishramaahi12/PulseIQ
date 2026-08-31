function Footer() {

  return (
    <footer
      id="contact"
      className="site-footer"
    >

      <div className="footer-container">

        <div className="footer-contact">

          <div className="footer-contact-content">

            <span className="footer-eyebrow">
              LET'S TALK
            </span>

            <h2>
              Your data has
              <br />
              more to say.
            </h2>

            <p>
              Ready to turn your business numbers into
              clearer decisions?
            </p>

          </div>

          <a
            href="mailto:hello@pulseiq.com"
            className="footer-contact-button"
          >
            Get in touch
            <span>↗</span>
          </a>

        </div>

        <div className="footer-main">

          <div className="footer-brand">

            <h2>
              Pulse<span>IQ</span>
            </h2>

            <p>
              AI-powered business intelligence that turns
              complex data into clear business decisions.
            </p>

          </div>

          <div className="footer-links">

            <a href="#features">
              Features
            </a>

            <a href="#pricing">
              Pricing
            </a>

            <a href="#about">
              About
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 PulseIQ. All rights reserved.
          </span>

          <span>
            Business intelligence for smarter decisions.
          </span>

        </div>

      </div>

    </footer>
  );
}

export default Footer;