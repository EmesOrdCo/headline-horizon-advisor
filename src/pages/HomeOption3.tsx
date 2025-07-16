import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Activity, 
  LineChart, 
  TrendingUp, 
  Star, 
  PieChart, 
  Target,
  Clock,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const HomeOption3 = () => {
  useSEO({
    title: "MarketSensorAI - Navigation Hub",
    description: "Simple and clean access to all market analysis tools and features",
    canonical: "https://yourdomain.com/home-option3",
  });

  const navigationItems = [
    {
      title: "Live Market News",
      description: "Real-time market updates with AI sentiment analysis and confidence scoring",
      icon: Activity,
      link: "/dashboard",
      status: "Live",
      statusColor: "bg-emerald-500"
    },
    {
      title: "My Stocks",
      description: "Personal portfolio tracking with custom watchlists and price alerts",
      icon: LineChart,
      link: "/my-stocks",
      status: "Personal",
      statusColor: "bg-blue-500"
    },
    {
      title: "Biggest Movers",
      description: "Discover the most significant market movements and trading opportunities",
      icon: TrendingUp,
      link: "/biggest-movers",
      status: "Trending",
      statusColor: "bg-orange-500"
    },
    {
      title: "Magnificent 7",
      description: "Deep analysis of Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta",
      icon: Star,
      link: "/magnificent-7",
      status: "Featured",
      statusColor: "bg-purple-500"
    },
    {
      title: "Index Funds",
      description: "Comprehensive tracking of SPY, QQQ, DIA and other major market indices",
      icon: PieChart,
      link: "/index-funds",
      status: "Stable",
      statusColor: "bg-green-500"
    },
    {
      title: "AI Predictions",
      description: "Machine learning-powered market forecasts and trading recommendations",
      icon: Target,
      link: "/predictions",
      status: "AI Powered",
      statusColor: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white">
              Market<span className="text-emerald-400">Sensor</span>AI
            </h1>
          </div>
          <p className="text-lg text-slate-300 mb-2">
            Your gateway to intelligent market analysis
          </p>
          <p className="text-slate-500">
            Choose a destination to explore market insights and data
          </p>
        </div>

        {/* Status Bar */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Market Open</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-slate-600" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Live Data</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-slate-600" />
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">AI Analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation List */}
        <div className="space-y-4 mb-12">
          {navigationItems.map((item, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <Badge className={`${item.statusColor} text-white text-xs`}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Link to={item.link}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="text-emerald-400 border-emerald-400 hover:bg-emerald-400 hover:text-slate-900 ml-4"
                    >
                      Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Everything you need for market analysis
            </h3>
            <p className="text-slate-400 mb-4">
              Real-time data, AI-powered insights, and comprehensive market coverage
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <span>• Live Updates</span>
              <span>• AI Analysis</span>
              <span>• Personal Tracking</span>
              <span>• Market Trends</span>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default HomeOption3;