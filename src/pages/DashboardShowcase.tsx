
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Layout, BarChart3, Grid3x3, Layers, Zap } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const DashboardShowcase = () => {
  useSEO({
    title: "Dashboard Layout Showcase",
    description: "Explore different dashboard layout variants for the live financial news and AI-powered market analysis platform.",
    canonical: "https://yourdomain.com/dashboard-showcase"
  });

  const variants = [
    {
      id: "dashboard",
      title: "Current Dashboard",
      description: "The original dashboard layout with focused sections for Magnificent 7 and Index Funds",
      icon: Layout,
      color: "emerald",
      features: ["Two-column layout", "Sidebar navigation", "Live market ticker", "AI confidence indicators"]
    },
    {
      id: "dashboard-variant-1", 
      title: "Hero-Driven Layout",
      description: "Reuters-inspired with prominent featured story and organized content sections",
      icon: BarChart3,
      color: "blue",
      features: ["Hero featured analysis", "Market movers widget", "Quick actions sidebar", "Visual hierarchy"]
    },
    {
      id: "dashboard-variant-2",
      title: "News-First Design", 
      description: "Bloomberg-style with comprehensive sidebar and breaking news emphasis",
      icon: Layers,
      color: "purple",
      features: ["Breaking news header", "Comprehensive sidebar", "Market overview", "Category organization"]
    },
    {
      id: "dashboard-variant-3",
      title: "Widget Dashboard",
      description: "SaaS dashboard approach with modular widgets and data visualization",
      icon: Grid3x3,
      color: "orange",
      features: ["Status widgets", "Modular design", "Data visualization", "Dashboard metrics"]
    },
    {
      id: "dashboard-variant-4",
      title: "Category Sections",
      description: "Organized by clear sections with category navigation and structured layout",
      icon: Layout,
      color: "cyan",
      features: ["Category navigation", "Section dividers", "Organized layout", "Clear hierarchy"]
    },
    {
      id: "dashboard-variant-5",
      title: "Mixed Visual Emphasis",
      description: "Hero content with data visualizations and comprehensive market insights",
      icon: Zap,
      color: "yellow",
      features: ["Hero section", "Visual emphasis", "Key metrics", "Mixed content types"]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: "from-emerald-900/20 to-emerald-800/20 border-emerald-500/30 text-emerald-400",
      blue: "from-blue-900/20 to-blue-800/20 border-blue-500/30 text-blue-400", 
      purple: "from-purple-900/20 to-purple-800/20 border-purple-500/30 text-purple-400",
      orange: "from-orange-900/20 to-orange-800/20 border-orange-500/30 text-orange-400",
      cyan: "from-cyan-900/20 to-cyan-800/20 border-cyan-500/30 text-cyan-400",
      yellow: "from-yellow-900/20 to-yellow-800/20 border-yellow-500/30 text-yellow-400"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-32 sm:pt-36 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Dashboard Layout Showcase</h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Explore different dashboard layouts inspired by Reuters, Bloomberg, and modern SaaS platforms. 
            Each variant offers a unique approach to organizing financial news and market analysis.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant) => {
            const IconComponent = variant.icon;
            const colorClasses = getColorClasses(variant.color);
            
            return (
              <Card 
                key={variant.id} 
                className={`bg-gradient-to-br ${colorClasses} hover:scale-105 transition-all duration-300 group`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="w-8 h-8" />
                    {variant.id === "dashboard" && (
                      <Badge className="bg-emerald-500 text-white text-xs">CURRENT</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white">{variant.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                    {variant.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="text-white font-medium text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {variant.features.map((feature, index) => (
                        <li key={index} className="text-slate-400 text-xs flex items-center gap-2">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link to={`/${variant.id}`} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-current hover:bg-current/10 group-hover:bg-current/20 transition-colors"
                    >
                      View Layout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Design Principles */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="p-6">
                <div className="text-blue-400 mb-3">
                  <BarChart3 className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Visual Hierarchy</h3>
                <p className="text-slate-400 text-sm">Clear information architecture with proper emphasis and section organization</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="p-6">
                <div className="text-emerald-400 mb-3">
                  <Layout className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Responsive Design</h3>
                <p className="text-slate-400 text-sm">Desktop-first approach with mobile-optimized layouts and components</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="p-6">
                <div className="text-purple-400 mb-3">
                  <Grid3x3 className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Modular Cards</h3>
                <p className="text-slate-400 text-sm">Flexible card-based system for displaying market data and analysis</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="p-6">
                <div className="text-orange-400 mb-3">
                  <Zap className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Professional Feel</h3>
                <p className="text-slate-400 text-sm">Clean typography, subtle shadows, and intuitive navigation patterns</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardShowcase;
