import Navbar from "../components/navbar";
import TrustedBy from "../components/trustedby";
import ScrollReveal from "../components/ScrollReveal";
import "./home.css";
import "../components/scrollReveal.css";

function Home() {
  return (
    <div className="home-page">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="hero-section" id="home">

        <ScrollReveal className="hero-copy">
          <span className="hero-label">
            PULSEIQ / BUSINESS INTELLIGENCE
          </span>

          <h1>
            What if your business
            <br />
            could <em>answer back?</em>
          </h1>

          <p>
            Your numbers already know more than they show.
            PulseIQ helps you ask better questions, understand
            what is happening and discover what deserves your attention.
          </p>

          <div className="hero-actions">
            <a href="/signup" className="primary-button">
              Ask PulseIQ →
            </a>

            <a href="/features" className="secondary-button">
              Explore the platform
            </a>
          </div>

          <div className="hero-note">
            Your data · Your questions · Your advantage
          </div>
        </ScrollReveal>


        {/* DASHBOARD PREVIEW */}
        <ScrollReveal
          direction="right"
          className="hero-preview"
        >

          


          <div className="preview-window">

            <div className="preview-top">
              <span></span>
              <span></span>
              <span></span>
            </div>


            <div className="preview-content">

              <div className="preview-kicker">
                PULSEIQ / BUSINESS PULSE
              </div>

              <h3>
                Your business, without the fog.
              </h3>

              <p className="preview-note">
                What is happening right now
              </p>


              <div className="preview-cards">

                <div className="preview-card">
                  <small>
                    Revenue
                  </small>

                  <strong>
                    ₹12.4L
                  </strong>
                </div>


                <div className="preview-card">
                  <small>
                    Customers
                  </small>

                  <strong>
                    2,841
                  </strong>
                </div>

              </div>


              <div className="preview-chart-wrap">

                <div className="preview-chart-header">

                  <span>
                    Business movement
                  </span>

                  <strong>
                    +18.4%
                  </strong>

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


                  <circle
                    cx="0"
                    cy="138"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="85"
                    cy="120"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="170"
                    cy="128"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="255"
                    cy="93"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="340"
                    cy="105"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="425"
                    cy="62"
                    r="5"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="510"
                    cy="72"
                    r="5"
                    fill="#22d3ee"
                  />

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

        </ScrollReveal>

      </section>


      {/* TRUSTED BY */}
      <ScrollReveal>
        <TrustedBy />
      </ScrollReveal>


      {/* THE PROBLEM */}
      <section className="home-story-section">

        <ScrollReveal>

          <span className="section-label">
            THE PROBLEM
          </span>

          <h2>
            You don't need another report.
            <br />
            You need to know what the report
            <br />
            <em>isn't telling you.</em>
          </h2>

          <p className="section-intro">
            The obvious numbers are easy to find.
            The important ones aren't.
          </p>

        </ScrollReveal>

      </section>


      {/* DATA TO DIRECTION */}
      <section className="home-flow-section">

        <ScrollReveal>

          <span className="section-label">
            FROM DATA TO DIRECTION
          </span>

          <h2>
            Somewhere between
            <br />
            <span className="accent-text">
              10,000 rows
            </span>{" "}
            and
            <br />
            one decision, clarity gets lost.
          </h2>

        </ScrollReveal>


        <div className="data-flow">

          <ScrollReveal delay={0}>
            <div className="data-flow-item">

              <strong>
                10,000+
              </strong>

              <span>
                Rows
              </span>

            </div>
          </ScrollReveal>


          <ScrollReveal delay={100}>
            <div className="data-flow-arrow">
              ↓
            </div>
          </ScrollReveal>


          <ScrollReveal delay={150}>
            <div className="data-flow-item">

              <strong>
                347
              </strong>

              <span>
                Metrics
              </span>

            </div>
          </ScrollReveal>


          <ScrollReveal delay={250}>
            <div className="data-flow-arrow">
              ↓
            </div>
          </ScrollReveal>


          <ScrollReveal delay={300}>
            <div className="data-flow-item">

              <strong>
                29
              </strong>

              <span>
                Changes
              </span>

            </div>
          </ScrollReveal>


          <ScrollReveal delay={400}>
            <div className="data-flow-arrow">
              ↓
            </div>
          </ScrollReveal>


          <ScrollReveal delay={450}>
            <div className="data-flow-item highlight">

              <strong>
                7
              </strong>

              <span>
                Important signals
              </span>

            </div>
          </ScrollReveal>


          <ScrollReveal delay={550}>
            <div className="data-flow-arrow">
              ↓
            </div>
          </ScrollReveal>


          <ScrollReveal delay={600}>
            <div className="data-flow-item final">

              <strong>
                1
              </strong>

              <span>
                Clear direction
              </span>

            </div>
          </ScrollReveal>

        </div>

      </section>


      {/* ASK YOUR BUSINESS */}
      <section className="ask-business-section">

        <ScrollReveal>

          <span className="section-label">
            ASK YOUR BUSINESS
          </span>

          <h2>
            If you could ask your business
            <br />
            one question right now,
            <br />
            <em>what would it be?</em>
          </h2>

        </ScrollReveal>


        <div className="question-grid">

          <ScrollReveal delay={0}>
            <div className="question-card">
              <span>
                Why are sales slowing down?
              </span>

              <span className="question-arrow">
                →
              </span>
            </div>
          </ScrollReveal>


          <ScrollReveal delay={100}>
            <div className="question-card">
              <span>
                Which customers are leaving?
              </span>

              <span className="question-arrow">
                →
              </span>
            </div>
          </ScrollReveal>


          <ScrollReveal delay={200}>
            <div className="question-card">
              <span>
                What's actually driving growth?
              </span>

              <span className="question-arrow">
                →
              </span>
            </div>
          </ScrollReveal>


          <ScrollReveal delay={300}>
            <div className="question-card">
              <span>
                Where are we losing money?
              </span>

              <span className="question-arrow">
                →
              </span>
            </div>
          </ScrollReveal>


          <ScrollReveal delay={400}>
            <div className="question-card">
              <span>
                What changed this week?
              </span>

              <span className="question-arrow">
                →
              </span>
            </div>
          </ScrollReveal>

        </div>

      </section>


      {/* ANSWER */}
      <section className="answer-section">

        <ScrollReveal direction="left">

          <div className="answer-question">

            <span className="section-label">
              YOUR QUESTION
            </span>

            <h3>
              Why did our revenue fall this month?
            </h3>

          </div>

        </ScrollReveal>


        <ScrollReveal direction="right">

          <div className="answer-box">

            <span className="section-label">
              PULSEIQ ANSWER
            </span>

            <h2>
              Revenue fell{" "}
              <span className="accent-text">
                7.2%
              </span>.
            </h2>

            <p>
              But the bigger story is that returning customers
              purchased less frequently, while new-customer
              acquisition remained stable.
            </p>


            <div className="answer-insight">

              <span>
                REPEAT PURCHASES
              </span>

              <strong>
                -14%
              </strong>

            </div>


            <div className="answer-insight">

              <span>
                NEW CUSTOMERS
              </span>

              <strong>
                +3.8%
              </strong>

            </div>

          </div>

        </ScrollReveal>

      </section>


      {/* THE AHA MOMENT */}
      <section className="aha-section">

        <ScrollReveal>

          <span className="section-label">
            THE MOMENT THAT MATTERS
          </span>

          <h2>
            Sometimes the most valuable number
            <br />
            is the one you
            <br />
            <em>weren't looking for.</em>
          </h2>

        </ScrollReveal>


        <ScrollReveal delay={200}>

          <div className="aha-card">

            <div className="aha-main">
              Revenue looks healthy.
            </div>

            <div className="aha-warning">
              Repeat purchases ↓ 14%
            </div>

            <p>
              That's the number worth noticing.
            </p>

          </div>

        </ScrollReveal>

      </section>


      {/* PRISM AI */}
      <section className="prism-preview-section">

        <ScrollReveal>

          <span className="section-label">
            PRISM AI / YOUR BUSINESS COPILOT
          </span>

          <h2>
            Talk to the numbers.
            <br />
            <em>Not the spreadsheet.</em>
          </h2>

          <p className="section-intro">
            Ask questions the way you'd ask a person on your team.
            Prism AI turns your business data into answers you can
            actually understand.
          </p>

        </ScrollReveal>


        <div className="prism-chat-preview">

          <ScrollReveal direction="left">

            <div className="chat-message user-message">

              <span className="chat-label">
                YOU
              </span>

              <p>
                What should I be worried about?
              </p>

            </div>

          </ScrollReveal>


          <ScrollReveal
            direction="right"
            delay={200}
          >

            <div className="chat-message ai-message">

              <span className="chat-label">
                PRISM AI
              </span>

              <p>
                Your revenue is healthy, but repeat purchases
                have fallen for three weeks.
              </p>

              <div className="ai-detail">
                The biggest change is coming from customers
                acquired through your January campaign.
              </div>

            </div>

          </ScrollReveal>


          <ScrollReveal
            direction="left"
            delay={400}
          >

            <div className="chat-message user-message">

              <span className="chat-label">
                YOU
              </span>

              <p>
                What should I do?
              </p>

            </div>

          </ScrollReveal>


          <ScrollReveal
            direction="right"
            delay={600}
          >

            <div className="chat-message ai-message">

              <span className="chat-label">
                PRISM AI
              </span>

              <p>
                Start by reviewing the post-purchase journey
                for that customer segment.
              </p>

            </div>

          </ScrollReveal>

        </div>


        <ScrollReveal delay={700}>

          <a
            href="/prismai"
            className="primary-button prism-button"
          >
            Meet Prism AI →
          </a>

        </ScrollReveal>

      </section>


      {/* PULSEIQ PROMISE */}
      <section className="promise-section">

        <ScrollReveal>

          <span className="section-label">
            THE PULSEIQ PROMISE
          </span>

        </ScrollReveal>


        <ScrollReveal delay={100}>

          <div className="promise-item">

            <strong>
              NOTICE.
            </strong>

            <span>
              Don't miss what changed.
            </span>

          </div>

        </ScrollReveal>


        <ScrollReveal delay={250}>

          <div className="promise-item">

            <strong>
              QUESTION.
            </strong>

            <span>
              Don't settle for what happened.
            </span>

          </div>

        </ScrollReveal>


        <ScrollReveal delay={400}>

          <div className="promise-item">

            <strong>
              MOVE.
            </strong>

            <span>
              Don't wait until it's too late.
            </span>

          </div>

        </ScrollReveal>


        <ScrollReveal delay={550}>

          <p className="promise-ending">

            PulseIQ exists for the space between
            <br />

            <span>
              "something changed"
            </span>

            <br />

            and
            <br />

            <span>
              "what do we do about it?"
            </span>

          </p>

        </ScrollReveal>

      </section>


      {/* VISION */}
      <section className="vision-section">

        <ScrollReveal>

          <span className="section-label">
            THIS IS JUST THE BEGINNING
          </span>

          <h2>
            Imagine knowing where to look
            <br />
            before you know what
            <br />
            you're looking for.
          </h2>

          <p>
            That's the kind of business intelligence we're building.
          </p>


          <div className="vision-brand">

            <strong>
              Pulse<span>IQ</span>
            </strong>

            <small>
              Less searching. More knowing.
            </small>

          </div>

        </ScrollReveal>

      </section>


      {/* FINAL CTA */}
      <section className="final-cta-section">

        <ScrollReveal>

          <span className="section-label">
            YOUR NEXT QUESTION STARTS HERE
          </span>

          <h2>
            Go ahead.
            <br />
            Ask your business
            <br />
            <em>something.</em>
          </h2>

          <p>
            Start with your own data or explore PulseIQ
            with sample data.
          </p>

          <a
            href="/signup"
            className="primary-button"
          >
            Try PulseIQ →
          </a>

        </ScrollReveal>

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

          <a href="/">
            Home
          </a>

          <a href="/features">
            Features
          </a>

          <a href="/about">
            About
          </a>

          <a href="/why">
            Why PulseIQ
          </a>

          <a href="/pricing">
            Pricing
          </a>

          <a href="/contact">
            Contact
          </a>

        </div>


        <div className="footer-copy">
          © 2026 PulseIQ. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default Home;