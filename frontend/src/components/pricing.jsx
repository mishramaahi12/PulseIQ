import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

function Pricing() {
  const plans = [
    {
      name: "Starter",
      note: "For exploring PulseIQ",
      features: [
        "Sample business dashboard",
        "Basic performance metrics",
        "CSV data preview",
        "Core business insights",
      ],
    },
    {
      name: "Growth",
      note: "For growing teams",
      popular: true,
      features: [
        "Everything in Starter",
        "Unlimited dashboard analysis",
        "AI-powered business insights",
        "Advanced performance tracking",
        "Priority support",
      ],
    },
    {
      name: "Scale",
      note: "For serious teams",
      features: [
        "Everything in Growth",
        "Advanced analytics",
        "Custom business reporting",
        "Team-ready workflows",
        "Dedicated support",
      ],
    },
  ];

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">

        <div className="pricing-heading">
          <span className="section-label">SIMPLE PRICING</span>

          <h2>
            Start small.
            <br />
            Grow when you need to.
          </h2>

          <p>
            Choose the workspace that fits your business today.
            More powerful plans are coming soon.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? "popular" : ""}`}
            >
              {plan.popular && (
                <span className="popular-badge">
                  MOST POPULAR
                </span>
              )}

              <h3>{plan.name}</h3>

              <div className="coming-soon-price">
                Coming soon
              </div>

              <div className="price-note">
                {plan.note}
              </div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="pricing-button">
                Get started
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;