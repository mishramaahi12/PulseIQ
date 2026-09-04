import { useLocation } from "react-router-dom";

import Navbar from "../components/navbar";
import Pricing from "../components/pricing";
import Testimonials from "../components/testimonials";
import Contact from "../components/contact";
import ScrollReveal from "../components/ScrollReveal";

import "./home.css";
import "../components/scrollReveal.css";

function Footer() {
  return (
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
  );
}


/* -------------------------------------------------------
   FEATURES PAGE
------------------------------------------------------- */

function FeaturesPage() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <section className="home-section">

          <ScrollReveal>
            <span className="section-label">
              WHAT PULSEIQ DOES
            </span>

            <h1>
              Everything your data
              <br />
              was trying to tell you.
            </h1>

            <p className="section-intro">
              PulseIQ turns raw business information into
              understandable insights, useful patterns and
              decisions you can actually act on.
            </p>
          </ScrollReveal>


          <div className="feature-grid">

            <ScrollReveal delay={0}>
              <div className="feature-card">

                <span className="feature-number">
                  01
                </span>

                <h3>
                  Smart Data Upload
                </h3>

                <p>
                  Upload your business data and let PulseIQ
                  understand the structure, columns and important
                  metrics without making you manually configure
                  every detail.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={150}>
              <div className="feature-card">

                <span className="feature-number">
                  02
                </span>

                <h3>
                  Automatic Insights
                </h3>

                <p>
                  Discover unusual changes, growing trends and
                  important movements hidden inside your numbers
                  before they become expensive problems.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={300}>
              <div className="feature-card">

                <span className="feature-number">
                  03
                </span>

                <h3>
                  KPI Intelligence
                </h3>

                <p>
                  Keep revenue, orders, customers, growth and
                  other important business metrics visible in one
                  clear workspace.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={450}>
              <div className="feature-card">

                <span className="feature-number">
                  04
                </span>

                <h3>
                  Customer Insights
                </h3>

                <p>
                  Understand who your customers are, how their
                  behaviour is changing and which segments deserve
                  your attention.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={600}>
              <div className="feature-card">

                <span className="feature-number">
                  05
                </span>

                <h3>
                  Trend Detection
                </h3>

                <p>
                  Stop looking at isolated numbers. PulseIQ helps
                  you see the direction your business is moving
                  and where opportunities may be forming.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={750}>
              <div className="feature-card">

                <span className="feature-number">
                  06
                </span>

                <h3>
                  Prism AI
                </h3>

                <p>
                  Ask questions about your business in natural
                  language and turn complicated datasets into
                  understandable answers.
                </p>

              </div>
            </ScrollReveal>

          </div>

        </section>


        <section className="about-section">

          <ScrollReveal direction="left">

            <div className="about-copy">

              <span className="section-label">
                FROM DATA TO DECISION
              </span>

              <h2>
                Don't just know
                what happened.
                Understand why.
              </h2>

            </div>

          </ScrollReveal>


          <ScrollReveal direction="right">

            <div>

              <p className="about-description">
                A dashboard can tell you that revenue dropped.
                PulseIQ is designed to help you understand what
                changed, where it changed and what deserves your
                attention next.
              </p>

              <div className="about-points">

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    Find the numbers that actually matter.
                  </span>
                </div>

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    Understand patterns without digging through
                    endless spreadsheets.
                  </span>
                </div>

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    Turn insights into your next business move.
                  </span>
                </div>

              </div>

            </div>

          </ScrollReveal>

        </section>


        <ScrollReveal>
          <section className="why-section">

            <span className="section-label">
              SEE IT IN ACTION
            </span>

            <h2>
              Your data.
              <br />
              One clearer conversation.
            </h2>

            <p className="why-intro">
              Instead of asking yourself where to start, start
              with a question.
            </p>

            <div className="why-grid">

              <div className="why-card">
                <span className="why-card-number">
                  ?
                </span>

                <h3>
                  Why did revenue change?
                </h3>

                <p>
                  Ask Prism AI to investigate the movement and
                  explain the most important factors.
                </p>
              </div>

              <div className="why-card">
                <span className="why-card-number">
                  ?
                </span>

                <h3>
                  Which customers matter most?
                </h3>

                <p>
                  Explore customer behaviour and identify the
                  segments worth focusing on.
                </p>
              </div>

              <div className="why-card">
                <span className="why-card-number">
                  ?
                </span>

                <h3>
                  What should I look at next?
                </h3>

                <p>
                  Let your data guide your attention instead of
                  spending hours deciding where to begin.
                </p>
              </div>

            </div>

          </section>
        </ScrollReveal>


        <ScrollReveal>
          <section className="home-section">

            <span className="section-label">
              READY WHEN YOU ARE
            </span>

            <h2>
              Upload your numbers.
              <br />
              Find what they mean.
            </h2>

            <p className="section-intro">
              Your next useful insight could already be sitting
              inside the data you have.
            </p>

            <div className="hero-actions">
              <a
                href="/signup"
                className="primary-button"
              >
                Start building your dashboard
              </a>
            </div>

          </section>
        </ScrollReveal>

      </main>

      <Footer />
    </>
  );
}


/* -------------------------------------------------------
   ABOUT PAGE
------------------------------------------------------- */

function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <section className="about-section">

          <ScrollReveal direction="left">

            <div className="about-copy">

              <span className="section-label">
                ABOUT PULSEIQ
              </span>

              <h1>
                Businesses don't have
                a data problem.
                They have a clarity problem.
              </h1>

            </div>

          </ScrollReveal>


          <ScrollReveal direction="right">

            <div>

              <p className="about-description">
                Every business creates data. Sales, customers,
                orders, revenue, transactions and performance
                numbers are generated every day.
              </p>

              <p className="about-description">
                But raw numbers don't tell you what deserves
                attention. PulseIQ exists to close that gap.
              </p>

            </div>

          </ScrollReveal>

        </section>


        <section className="home-section">

          <ScrollReveal>

            <span className="section-label">
              OUR MISSION
            </span>

            <h2>
              Make business intelligence
              feel less like analysis
              and more like understanding.
            </h2>

            <p className="section-intro">
              We believe powerful analytics should not require
              an analytics degree. PulseIQ is designed to make
              important business information easier to explore,
              understand and act on.
            </p>

          </ScrollReveal>

        </section>


        <section className="why-section">

          <ScrollReveal>

            <span className="section-label">
              WHAT WE BELIEVE
            </span>

            <h2>
              Intelligence should
              earn its place.
            </h2>

          </ScrollReveal>


          <div className="why-grid">

            <ScrollReveal delay={0}>
              <div className="why-card">

                <span className="why-card-number">
                  01
                </span>

                <h3>
                  Clarity over clutter
                </h3>

                <p>
                  More charts don't automatically mean more
                  understanding. We focus on useful information.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={150}>
              <div className="why-card">

                <span className="why-card-number">
                  02
                </span>

                <h3>
                  Questions over complexity
                </h3>

                <p>
                  Business owners should be able to ask questions
                  without learning a complicated analytics system.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={300}>
              <div className="why-card">

                <span className="why-card-number">
                  03
                </span>

                <h3>
                  Action over observation
                </h3>

                <p>
                  The purpose of an insight is not to look good.
                  It is to help someone make a better decision.
                </p>

              </div>
            </ScrollReveal>

          </div>

        </section>


        <ScrollReveal>
          <section className="home-section">

            <span className="section-label">
              THE PULSEIQ PROMISE
            </span>

            <h2>
              Less time understanding
              the data.
              More time acting on it.
            </h2>

            <p className="section-intro">
              We are building PulseIQ around one simple idea:
              business intelligence should help you move forward,
              not give you another screen to manage.
            </p>

          </section>
        </ScrollReveal>

      </main>

      <Footer />
    </>
  );
}


/* -------------------------------------------------------
   WHY PULSEIQ PAGE
------------------------------------------------------- */

function WhyPage() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <section className="why-section">

          <ScrollReveal>

            <span className="section-label">
              WHY CHOOSE PULSEIQ
            </span>

            <h1>
              Because your dashboard
              shouldn't become
              another job.
            </h1>

            <p className="why-intro">
              PulseIQ is designed around the decisions behind
              the numbers, not the number of charts you can put
              on a screen.
            </p>

          </ScrollReveal>


          <div className="why-grid">

            <ScrollReveal delay={0}>
              <div className="why-card">

                <span className="why-card-number">
                  01
                </span>

                <h3>
                  Clarity first
                </h3>

                <p>
                  Important numbers stay visible instead of
                  getting buried under unnecessary dashboards.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={150}>
              <div className="why-card">

                <span className="why-card-number">
                  02
                </span>

                <h3>
                  Decisions, not decoration
                </h3>

                <p>
                  Every insight should answer one important
                  question: what should I do next?
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={300}>
              <div className="why-card">

                <span className="why-card-number">
                  03
                </span>

                <h3>
                  AI that explains
                </h3>

                <p>
                  Prism AI turns patterns into understandable
                  business language instead of confusing output.
                </p>

              </div>
            </ScrollReveal>


            <ScrollReveal delay={450}>
              <div className="why-card">

                <span className="why-card-number">
                  04
                </span>

                <h3>
                  Built for real teams
                </h3>

                <p>
                  You shouldn't need an analytics team just to
                  understand your own business.
                </p>

              </div>
            </ScrollReveal>

          </div>

        </section>


        <section className="about-section">

          <ScrollReveal direction="left">

            <div className="about-copy">

              <span className="section-label">
                THE DIFFERENCE
              </span>

              <h2>
                From “What happened?”
                to “What do we do now?”
              </h2>

            </div>

          </ScrollReveal>


          <ScrollReveal direction="right">

            <div>

              <p className="about-description">
                Traditional reporting often stops at the number.
                PulseIQ is built to help you move from observation
                to understanding and finally to action.
              </p>

              <div className="about-points">

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    See what changed.
                  </span>
                </div>

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    Understand what matters.
                  </span>
                </div>

                <div className="about-point">
                  <div className="about-point-icon">
                    ✓
                  </div>

                  <span>
                    Decide what happens next.
                  </span>
                </div>

              </div>

            </div>

          </ScrollReveal>

        </section>


        <ScrollReveal>
          <section className="home-section">

            <span className="section-label">
              EXPERIENCE THE DIFFERENCE
            </span>

            <h2>
              Your data already knows
              more than you think.
            </h2>

            <p className="section-intro">
              Give PulseIQ a chance to help you find it.
            </p>

            <div className="hero-actions">

              <a
                href="/signup"
                className="primary-button"
              >
                Start with PulseIQ
              </a>

            </div>

          </section>
        </ScrollReveal>

      </main>

      <Footer />
    </>
  );
}


/* -------------------------------------------------------
   PRICING PAGE
------------------------------------------------------- */

function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <ScrollReveal>

          <section className="home-section">

            <span className="section-label">
              SIMPLE PRICING
            </span>

            <h1>
              Start with your data.
              <br />
              Scale when your decisions get bigger.
            </h1>

            <p className="section-intro">
              Start exploring PulseIQ without unnecessary
              complexity. Upgrade when your business needs
              more intelligence.
            </p>

          </section>

        </ScrollReveal>


        <ScrollReveal>
          <section id="pricing">
            <Pricing />
          </section>
        </ScrollReveal>


        <ScrollReveal>
          <section className="why-section">

            <span className="section-label">
              STILL DECIDING?
            </span>

            <h2>
              You don't need a data team
              to understand your business.
            </h2>

            <p className="why-intro">
              Start small. Bring your numbers. See what PulseIQ
              can uncover.
            </p>

            <div className="hero-actions">

              <a
                href="/signup"
                className="primary-button"
              >
                Start Free
              </a>

            </div>

          </section>
        </ScrollReveal>


        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>

      </main>

      <Footer />
    </>
  );
}


/* -------------------------------------------------------
   CONTACT PAGE
------------------------------------------------------- */

function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <ScrollReveal>

          <section className="home-section">

            <span className="section-label">
              LET'S TALK
            </span>

            <h1>
              Have a question,
              an idea, or a dataset
              waiting to be understood?
            </h1>

            <p className="section-intro">
              We'd love to hear from you. Whether you're
              exploring PulseIQ, have feedback, or want to
              discuss how it could fit your business, reach out.
            </p>

          </section>

        </ScrollReveal>


        <ScrollReveal direction="up">

          <section className="contact-wrapper">
            <Contact />
          </section>

        </ScrollReveal>


        <ScrollReveal>

          <section className="about-section">

            <div className="about-copy">

              <span className="section-label">
                BEFORE YOU MESSAGE US
              </span>

              <h2>
                Want to see PulseIQ
                in action first?
              </h2>

            </div>

            <div>

              <p className="about-description">
                Create your account and explore your business
                data first. Sometimes the fastest way to answer
                a question is to see the insight for yourself.
              </p>

              <div className="hero-actions">

                <a
                  href="/signup"
                  className="primary-button"
                >
                  Get Started
                </a>

              </div>

            </div>

          </section>

        </ScrollReveal>

      </main>

      <Footer />
    </>
  );
}


/* -------------------------------------------------------
   MAIN PUBLIC PAGE ROUTER
------------------------------------------------------- */

function PublicPages() {
  const location = useLocation();

  const path = location.pathname;

  if (path === "/features") {
    return <FeaturesPage />;
  }

  if (path === "/about") {
    return <AboutPage />;
  }

  if (path === "/why") {
    return <WhyPage />;
  }

  if (path === "/pricing") {
    return <PricingPage />;
  }

  if (path === "/contact") {
    return <ContactPage />;
  }

  return null;
}

export default PublicPages;