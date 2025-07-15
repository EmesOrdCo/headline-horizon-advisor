
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TrendingUp, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "AI-Powered Market Intelligence & Real-Time Predictions",
    description: "Empowering investors with AI-driven market intelligence and real-time predictions. Get comprehensive stock analysis, sentiment insights, and data-driven investment decisions.",
    canonical: "https://yourdomain.com/",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "name": "MarketSensorAI",
      "description": "AI-powered market intelligence and real-time stock predictions",
      "url": "https://yourdomain.com",
      "serviceType": "Financial Analysis",
      "provider": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "areaServed": "US",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Market Intelligence Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "AI Stock Analysis",
            "description": "Real-time AI-powered stock sentiment analysis"
          },
          {
            "@type": "Offer",
            "name": "Market Predictions",
            "description": "AI-generated market forecasts and predictions"
          }
        ]
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      <Hero />
      <Features />
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-16">Powered by Advanced AI</h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-16 px-4">
            Our platform combines cutting-edge machine learning with real-time market 
            data to give you the edge you need.
          </p>
          <div className="max-w-7xl mx-auto px-4">
            <AnalysisPipeline />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
