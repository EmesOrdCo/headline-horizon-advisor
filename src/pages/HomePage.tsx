import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import KeyFeatures from "@/components/KeyFeatures";
import HowItWorksTimeline from "@/components/HowItWorksTimeline";
import WhyDifferent from "@/components/WhyDifferent";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const HomePage = () => {
  useSEO({
    title: "MarketSensorAI - Take the Guesswork Out of Trading",
    description: "AI-powered market news, price-impact predictions, and one-click trading—all in one chat-driven copilot. Get early access to the future of trading.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MarketSensorAI",
      "description": "AI-powered trading intelligence platform",
      "url": "https://marketsensorai.com"
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <KeyFeatures />
      <HowItWorksTimeline />
      <WhyDifferent />
      <TestimonialsCarousel />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default HomePage;