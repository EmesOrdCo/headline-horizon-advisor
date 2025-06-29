
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TrendingUp, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      <Hero />
      <Features />
      <section id="powered-by-ai" className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-16">Powered by Advanced AI</h2>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto mb-16">
            Our platform combines cutting-edge machine learning with real-time market 
            data to give you the edge you need.
          </p>
          <div className="max-w-7xl mx-auto">
            <AnalysisPipeline />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
