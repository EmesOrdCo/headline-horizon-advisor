import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, BarChart3, Target, Star, PieChart, Activity, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const HomeOption1 = () => {
  useSEO({
    title: "MarketSensorAI - Feature Card Portal",
    description: "Access all market analysis tools and features through our comprehensive portal",
    canonical: "https://yourdomain.com/home-option1",
  });

  const features = [
    {
      title: "Live Market News",
      description: "Real-time market updates with AI-powered analysis and sentiment tracking",
      icon: Activity,
      link: "/dashboard",
      badge: "LIVE",
      badgeColor: "bg-emerald-500",
      preview: "Latest headlines updating every minute with confidence scoring"
    },
    {
      title: "My Stocks",
      description: "Track your personalized portfolio with detailed analysis and insights",
      icon: LineChart,
      link: "/my-stocks",
      badge: "PERSONAL",
      badgeColor: "bg-blue-500",
      preview: "Custom watchlist with AI predictions and price alerts"
    },
    {
      title: "Biggest Movers",
      description: "Discover the most significant market movements and opportunities",
      icon: TrendingUp,
      link: "/biggest-movers",
      badge: "TRENDING",
      badgeColor: "bg-orange-500",
      preview: "Top gainers and losers with momentum indicators"
    },
    {
      title: "Magnificent 7",
      description: "Deep dive into the seven tech giants driving market performance",
      icon: Star,
      link: "/magnificent-7",
      badge: "FEATURED",
      badgeColor: "bg-purple-500",
      preview: "AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META analysis"
    },
    {
      title: "Index Funds",
      description: "Comprehensive analysis of major market indices and ETFs",
      icon: PieChart,
      link: "/index-funds",
      badge: "STABLE",
      badgeColor: "bg-green-500",
      preview: "SPY, QQQ, DIA performance and sector breakdowns"
    },
    {
      title: "Predictions",
      description: "AI-generated market forecasts and trading recommendations",
      icon: Target,
      link: "/predictions",
      badge: "AI POWERED",
      badgeColor: "bg-red-500",
      preview: "Machine learning models predict market movements"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Market<span className="text-emerald-400">Sensor</span>AI
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Your comprehensive market analysis platform
          </p>
          <p className="text-slate-400">
            Choose your destination to explore real-time market insights
          </p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <feature.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                        <Badge className={`${feature.badgeColor} text-white text-xs`}>
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-300">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400 flex-1">
                    {feature.preview}
                  </p>
                  <Link to={feature.link}>
                    <Button 
                      variant="outline" 
                      className="ml-4 text-emerald-400 border-emerald-400 hover:bg-emerald-400 hover:text-slate-900"
                    >
                      Enter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-slate-800 border-slate-700 text-center">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Real-Time Data</h3>
              <p className="text-slate-400 text-sm">Live market updates</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 text-center">
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
              <p className="text-slate-400 text-sm">Smart predictions</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Market Trends</h3>
              <p className="text-slate-400 text-sm">Trend identification</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomeOption1;