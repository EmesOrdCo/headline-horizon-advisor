import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Users, Target, Star, PieChart, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const HomeOption2 = () => {
  useSEO({
    title: "MarketSensorAI - Dashboard Overview Portal",
    description: "Comprehensive market overview with live data previews and quick access to all analysis tools",
    canonical: "https://yourdomain.com/home-option2",
  });

  const sections = [
    {
      title: "Live Market News",
      description: "Real-time analysis and sentiment tracking",
      icon: Activity,
      link: "/dashboard",
      stats: [
        { label: "Headlines Today", value: "24", trend: "up" },
        { label: "Avg Confidence", value: "87%", trend: "up" },
        { label: "Bullish Sentiment", value: "64%", trend: "up" }
      ],
      badge: { text: "LIVE", color: "bg-emerald-500" }
    },
    {
      title: "My Stocks",
      description: "Your personalized portfolio tracking",
      icon: LineChart,
      link: "/my-stocks",
      stats: [
        { label: "Watchlist Items", value: "12", trend: "neutral" },
        { label: "Alerts Set", value: "8", trend: "up" },
        { label: "Performance", value: "+2.4%", trend: "up" }
      ],
      badge: { text: "PERSONAL", color: "bg-blue-500" }
    },
    {
      title: "Biggest Movers",
      description: "Market's most significant movements",
      icon: TrendingUp,
      link: "/biggest-movers",
      stats: [
        { label: "Top Gainer", value: "+12.5%", trend: "up" },
        { label: "Top Loser", value: "-8.3%", trend: "down" },
        { label: "Volume Leader", value: "AAPL", trend: "neutral" }
      ],
      badge: { text: "TRENDING", color: "bg-orange-500" }
    },
    {
      title: "Magnificent 7",
      description: "Tech giants performance analysis",
      icon: Star,
      link: "/magnificent-7",
      stats: [
        { label: "Avg Performance", value: "+3.2%", trend: "up" },
        { label: "Best Performer", value: "NVDA", trend: "up" },
        { label: "Market Cap", value: "$12.8T", trend: "up" }
      ],
      badge: { text: "FEATURED", color: "bg-purple-500" }
    },
    {
      title: "Index Funds",
      description: "Major indices and ETF analysis",
      icon: PieChart,
      link: "/index-funds",
      stats: [
        { label: "S&P 500", value: "+0.8%", trend: "up" },
        { label: "NASDAQ", value: "+1.2%", trend: "up" },
        { label: "Dow Jones", value: "+0.3%", trend: "up" }
      ],
      badge: { text: "STABLE", color: "bg-green-500" }
    },
    {
      title: "AI Predictions",
      description: "Machine learning market forecasts",
      icon: Target,
      link: "/predictions",
      stats: [
        { label: "Success Rate", value: "73%", trend: "up" },
        { label: "Active Signals", value: "15", trend: "neutral" },
        { label: "Confidence", value: "High", trend: "up" }
      ],
      badge: { text: "AI POWERED", color: "bg-red-500" }
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Market Overview Dashboard
          </h1>
          <p className="text-slate-400 mb-4">
            Live data and quick access to all analysis tools
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Market Summary Bar */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm">Market Status</p>
                <p className="text-emerald-400 font-semibold">OPEN</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Signals</p>
                <p className="text-white font-semibold">42</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Bullish Sentiment</p>
                <p className="text-emerald-400 font-semibold">68%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Volatility</p>
                <p className="text-orange-400 font-semibold">Medium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <section.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                        <Badge className={`${section.badge.color} text-white text-xs`}>
                          {section.badge.text}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400 text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {section.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-white font-semibold text-sm">{stat.value}</span>
                        {getTrendIcon(stat.trend)}
                      </div>
                      <p className="text-slate-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <Link to={section.link}>
                  <Button 
                    variant="outline" 
                    className="w-full text-emerald-400 border-emerald-400 hover:bg-emerald-400 hover:text-slate-900"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Fast access to common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Set Alert
              </Button>
              <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                <Target className="w-4 h-4 mr-2" />
                View Predictions
              </Button>
              <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                <Activity className="w-4 h-4 mr-2" />
                Market Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default HomeOption2;