import React from "react";

function WhyChoose() {
const reasons = [
{
number: "01",
title: "Save Time",
description:
"Automate repetitive reporting and spend more time making important business decisions.",
},
{
number: "02",
title: "Increase Revenue",
description:
"AI-powered insights help identify opportunities to improve sales and grow your business.",
},
{
number: "03",
title: "Simple to Use",
description:
"Upload your data and start analyzing within minutes without needing technical skills.",
},
];

return ( <section className="why-section" id="why-choose"> <div className="why-container"> <div className="why-heading"> <span className="section-label">WHY PULSEIQ</span>

```
      <h2>
        Everything you need to make
        <span> better decisions.</span>
      </h2>

      <p>
        PulseIQ combines AI, analytics and an intuitive dashboard to help
        businesses understand their numbers and move forward with confidence.
      </p>
    </div>

    <div className="why-grid">
      {reasons.map((item) => (
        <div className="why-card" key={item.number}>
          <span className="why-number">{item.number}</span>

          <h3>{item.title}</h3>

          <p>{item.description}</p>

          <span className="why-arrow">↗</span>
        </div>
      ))}
    </div>
  </div>
</section>


);
}

export default WhyChoose;