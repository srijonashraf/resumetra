import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import PainPoints from "../components/landing/PainPoints";
import Features from "../components/landing/Features";
import Privacy from "../components/landing/Privacy";
import HowToUse from "../components/landing/HowToUse";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Hero />
      <PainPoints />
      <Features />
      <Privacy />
      <HowToUse />
      <FAQ />
      <Footer />
    </div>
  );
}
