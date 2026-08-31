function Features() {

  const features = [

    {
      number: "01",
      title: "Your Data Has A Story.",
      description:
        "PulseIQ connects the scattered pieces—sales, customers, revenue and performance—so the bigger picture finally makes sense."
    },

    {
      number: "02",
      title: "Talk Numbers. Get Answers.",
      description:
        "Stop hunting through spreadsheets. Ask Prism AI a business question and get a clear answer you can actually act on."
    },

    {
      number: "03",
      title: "Find The Signal In The Noise.",
      description:
        "Not every number deserves your attention. PulseIQ helps surface the changes, patterns and opportunities that actually matter."
    },

    {
      number: "04",
      title: "Raw Data In. Clarity Out.",
      description:
        "Upload your CSV and let PulseIQ turn rows of data into dashboards, trends and insights that are easier to understand."
    },

    {
      number: "05",
      title: "Know The Why, Not Just The What.",
      description:
        "A number can tell you what happened. PulseIQ helps you understand the story behind it—and where to look next."
    },

    {
      number: "06",
      title: "Built For Your Next Move.",
      description:
        "Whether you're exploring your first dataset or scaling your analytics workflow, PulseIQ grows with the way you work."
    }

  ];

  return (

    <section id="features" className="home-section">

      <span className="section-label">
        WHAT PULSEIQ BRINGS
      </span>

      <h2>
        Less searching.
        <br />
        More knowing.
      </h2>

      <p className="section-intro">
        Everything PulseIQ does is designed around one idea:
        make business data easier to understand and harder to ignore.
      </p>

      <div className="feature-grid">

        {features.map((feature) => (

          <article
            className="feature-card"
            key={feature.number}
          >

            <span>{feature.number}</span>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>

          </article>

        ))}

      </div>

    </section>

  );

}

export default Features;