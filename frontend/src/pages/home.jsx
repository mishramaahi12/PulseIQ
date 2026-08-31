import Navbar from "../components/navbar";
import Pricing from "../components/pricing";
import Testimonials from "../components/testimonials";
import TrustedBy from "../components/trustedby";
import Contact from "../components/contact";
import "./home.css";

function Home() {
  return (
    <div className="home-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <span className="hero-label">
            BUSINESS INTELLIGENCE, WITHOUT THE NOISE
          </span>

          <h1>
            Know what your <em>business</em> needs next.
          </h1>

          <p>
            PulseIQ turns scattered business numbers into clear signals,
            useful insights and confident decisions — without the spreadsheet
            chaos.
          </p>

          <div className="hero-actions">
            <a href="/signup" className="primary-button">
              Start building your dashboard
            </a>

            <a href="#features" className="secondary-button">
              Explore PulseIQ
            </a>
          </div>

          <div className="hero-note">
            No credit card required · Start with sample data
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-top">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="preview-content">
              <div className="preview-kicker">
                BUSINESS OVERVIEW
              </div>

              <h3>
                Your numbers, finally in one place.
              </h3>

              <p className="preview-note">
                Revenue performance · Last 7 months
              </p>

              <div className="preview-cards">
                <div className="preview-card">
                  <small>Revenue</small>
                  <strong>₹12.4L</strong>
                </div>

                <div className="preview-card">
                  <small>Growth</small>
                  <strong>+32%</strong>
                </div>
              </div>

              <div className="preview-chart-wrap">
                <div className="preview-chart-header">
                  <span>Revenue trend</span>
                  <strong>+32.4%</strong>
                </div>

                <svg
                  className="preview-svg"
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    y1="145"
                    x2="600"
                    y2="145"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <line
                    x1="0"
                    y1="95"
                    x2="600"
                    y2="95"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <line
                    x1="0"
                    y1="45"
                    x2="600"
                    y2="45"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <polyline
                    points="
                      0,138
                      85,120
                      170,128
                      255,93
                      340,105
                      425,62
                      510,72
                      600,28
                    "
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle cx="0" cy="138" r="5" fill="#22d3ee" />
                  <circle cx="85" cy="120" r="5" fill="#22d3ee" />
                  <circle cx="170" cy="128" r="5" fill="#22d3ee" />
                  <circle cx="255" cy="93" r="5" fill="#22d3ee" />
                  <circle cx="340" cy="105" r="5" fill="#22d3ee" />
                  <circle cx="425" cy="62" r="5" fill="#22d3ee" />
                  <circle cx="510" cy="72" r="5" fill="#22d3ee" />

                  <circle
                    cx="600"
                    cy="28"
                    r="7"
                    fill="#ffffff"
                    stroke="#22d3ee"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <TrustedBy />

            {/* FEATURES */}
      <section
        id="features"
        className="home-section"
      >
        <span className="section-label">
          WHAT PULSEIQ DOES
        </span>

        <h2>
          Your data has a story.
          <br />
          We help you read it.
        </h2>

        <p className="section-intro">
          PulseIQ turns scattered business numbers into signals
          you can understand, questions you can ask, and decisions
          you can act on.
        </p>

        <div className="feature-grid">

          <div className="feature-card">
            <span className="feature-number">01</span>

            <h3>
              Find the signal.
            </h3>

            <p>
              Revenue went up. Customers dropped. Orders changed.
              PulseIQ brings those movements together so you know
              what deserves your attention.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-number">02</span>

            <h3>
              Talk to your numbers.
            </h3>

            <p>
              Instead of searching through rows and charts, ask
              Prism AI what changed, what matters and where your
              next opportunity could be.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-number">03</span>

            <h3>
              Turn insight into action.
            </h3>

            <p>
              Numbers are useful only when they lead somewhere.
              PulseIQ helps turn patterns and opportunities into
              clearer, smarter business moves.
            </p>
          </div>

        </div>
      </section>
      {/* ABOUT */}
      <section
        id="about"
        className="about-section"
      >
        <div className="about-copy">
          <span className="section-label">
            ABOUT PULSEIQ
          </span>

          <h2>
            Less time understanding the data.
            More time acting on it.
          </h2>
        </div>

        <div>
          <p className="about-description">
            PulseIQ is built for businesses that have plenty
            of numbers but not enough clarity. It brings
            everyday business information into one intelligent
            workspace so important signals are easier to find,
            understand and act on.
          </p>

          <div className="about-points">
            <div className="about-point">
              <div className="about-point-icon">✓</div>

              <span>
                One workspace for the numbers that matter.
              </span>
            </div>

            <div className="about-point">
              <div className="about-point-icon">✓</div>

              <span>
                Insights designed around decisions, not dashboards.
              </span>
            </div>

            <div className="about-point">
              <div className="about-point-icon">✓</div>

              <span>
                Built to make business intelligence feel simple.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PULSEIQ */}
      <section
        id="why"
        className="why-section"
      >
        <span className="section-label">
          WHY CHOOSE PULSEIQ
        </span>

        <h2>
          Intelligence that earns
          <br />
          its place in your workflow.
        </h2>

        <p className="why-intro">
          Good analytics should not make your work more
          complicated. PulseIQ focuses on the signals,
          explains what they mean and helps you decide
          what deserves attention next.
        </p>

        <div className="why-grid">
          <div className="why-card">
            <span className="why-card-number">01</span>

            <h3>Clarity first</h3>

            <p>
              Important numbers stay visible instead of
              getting buried under unnecessary dashboards.
            </p>
          </div>

          <div className="why-card">
            <span className="why-card-number">02</span>

            <h3>Decisions, not decoration</h3>

            <p>
              Every insight should answer the question:
              what should I do next?
            </p>
          </div>

          <div className="why-card">
            <span className="why-card-number">03</span>

            <h3>AI that explains</h3>

            <p>
              Prism AI turns patterns into understandable
              business language instead of confusing output.
            </p>
          </div>

          <div className="why-card">
            <span className="why-card-number">04</span>

            <h3>Made for real teams</h3>

            <p>
              No analytics degree required. Bring your data
              and start finding useful answers.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <Pricing />
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CONTACT */}
      <section id="contact" className="contact-wrapper">
        <Contact />
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-brand">
          <strong>
            Pulse<span>IQ</span>
          </strong>

          <span>
            Business intelligence for smarter decisions.
          </span>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-copy">
          © 2026 PulseIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;