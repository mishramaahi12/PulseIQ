import { useEffect, useState } from "react";

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import TrustedBy from "./components/trustedby";
import Features from "./components/features";
import WhyChoose from "./components/whychoose";
import Pricing from "./components/pricing";
import DashboardPreview from "./components/dashboardpreview";
import Testimonials from "./components/testimonials";
import Contact from "./components/contact";
import Footer from "./components/footer";
import FloatingAI from "./components/floatingai";

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <WhyChoose />
      <Pricing />
      <DashboardPreview />
      <Testimonials />
      <Contact />
      <Footer />
      <FloatingAI />
    </div>
  );
}

export default App;