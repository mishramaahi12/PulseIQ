function Testimonials() {
  const reviews = [
    {
      name: "Rahul Sharma",
      role: "Founder • UrbanKart",
      review:
        "PulseIQ simplified our reporting process. We now spend less time analyzing data and more time making confident business decisions.",
    },
    {
      name: "Priya Patel",
      role: "Operations Manager • NexRetail",
      review:
        "The dashboard is incredibly easy to use. Prism AI helped us identify customer trends that we had completely overlooked.",
    },
    {
      name: "Arjun Mehta",
      role: "Business Consultant",
      review:
        "Instead of spending hours creating reports, PulseIQ gives us meaningful insights within minutes. It has become part of our daily workflow.",
    },
  ];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-container">

        <div className="testimonials-heading">
          <p className="testimonials-label">TESTIMONIALS</p>

          <h2>Trusted by growing businesses.</h2>

          <p>
            Businesses rely on PulseIQ every day to make smarter,
            data-driven decisions with confidence.
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((item, index) => (
            <div className="testimonial-card" key={index}>

              <div className="testimonial-profile">
                <div className="testimonial-avatar">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3>{item.name}</h3>
                  <p>{item.role}</p>
                </div>
              </div>

              <p className="testimonial-review">
                "{item.review}"
              </p>

              <div className="testimonial-stars">
                ★ ★ ★ ★ ★
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;