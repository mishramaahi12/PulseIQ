import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 3000);
  };

  return (
    <section className="contact-section">
      <div className="contact-info">
        <span className="section-label">
          CONTACT PULSEIQ
        </span>

        <h2>
          Start a conversation.
        </h2>

        <p className="contact-description">
          We're here to help you make better decisions
          with your data.
        </p>

        <div className="contact-email-box">
          <div className="contact-icon">
            <Mail size={20} />
          </div>

          <div>
            <span>Email us</span>

            <a href="mailto:pulseiq005@gmail.com">
              pulseiq005@gmail.com
            </a>
          </div>
        </div>

        <div className="contact-support">
          <span>Support</span>

          <p>
            Have a question about PulseIQ, your dashboard,
            or your data? Send us a message and we'll get
            back to you.
          </p>

          <small>
            We usually respond within one business day.
          </small>
        </div>
      </div>

      <div className="contact-form-card">
        <div className="contact-form-header">
          <span>Let's talk</span>

          <p>
            Tell us what you're building.
          </p>
        </div>

        {sent ? (
          <div className="contact-success">
            <CheckCircle2 size={25} />

            <h3>Message sent!</h3>

            <p>
              Thanks for reaching out to PulseIQ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">
                Name
              </label>

              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">
                Email
              </label>

              <input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                rows="6"
                placeholder="Tell us how we can help..."
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit"
            >
              <span>Send message</span>
              <Send size={17} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Contact;