
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import PredictionCard from "@/components/PredictionCard";
import { useSEO } from "@/hooks/useSEO";

const Predictions = () => {
  useSEO({
    title: "AI Stock Predictions & Market Forecasts",
    description: "Get AI-generated stock predictions and market forecasts with confidence scores. Advanced machine learning models provide 24-hour price predictions for major stocks.",
    canonical: "https://yourdomain.com/predictions",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "AI Stock Predictions & Market Forecasts",
      "description": "AI-generated stock predictions with confidence scores",
      "author": {
        "@type": "Organization",
        "name": "MarketSensorAI"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://yourdomain.com/predictions"
      }
    }
  });
  const predictions = [
    {
      symbol: "AAPL",
      current: 178.5,
      predicted: 182.3,
      change: 2.13,
      confidence: 78,
      timeframe: "24h"
    },
    {
      symbol: "TSLA", 
      current: 245.8,
      predicted: 238.9,
      change: -2.81,
      confidence: 65,
      timeframe: "24h"
    },
    {
      symbol: "NVDA",
      current: 712.4,
      predicted: 728.6, 
      change: 2.27,
      confidence: 82,
      timeframe: "24h"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNav />
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Predictions</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">Keep up with the latest AI-generated market forecasts</p>
        </div>

        <div className="mb-6">
          <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Active Predictions</h2>
            
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <PredictionCard key={index} {...prediction} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Predictions;
