import Navbar from "./components/navbar";
import Hero from "./components/hero";
import TrustedBy from "./components/trustedby";
import Features from "./components/features";
import WhyChoose from "./components/whychoose";
import Pricing from "./components/pricing";
import DashboardPreview from "./components/dashboardpreview";
import Footer from "./components/footer";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <WhyChoose />
      <Pricing />
      <DashboardPreview />
      <Footer />
    </>
  );
}

export default App;