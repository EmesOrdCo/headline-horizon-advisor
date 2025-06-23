
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import PredictionCard from "@/components/PredictionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  // Filter for Magnificent 7 stocks only
  const magnificent7News = newsData?.filter(item => 
    ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'].includes(item.symbol)
  ) || [];

  const handleRefreshNews = async () => {
    setIsFetching(true);
    try {
      await fetchNews();
      await refetch();
      toast({
        title: "News Updated",
        description: "Latest news has been fetched and analyzed for Magnificent 7 stocks.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

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
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Magnificent 7 Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-slate-400 text-sm">AI Analyzed</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh News
            </Button>
          </div>
          <p className="text-slate-400">Latest AI-analyzed news for Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-slate-400 py-8">
                  Loading Magnificent 7 news...
                </div>
              ) : magnificent7News && magnificent7News.length > 0 ? (
                magnificent7News.slice(0, 3).map((item, index) => (
                  <NewsCard 
                    key={item.id} 
                    symbol={item.symbol}
                    priority={item.priority}
                    title={item.title}
                    description={item.description}
                    prediction={item.ai_prediction}
                    confidence={item.ai_confidence}
                    sentiment={item.ai_sentiment}
                    category={item.category}
                  />
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No Magnificent 7 news available. Click "Refresh News" to fetch the latest headlines.
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-[600px] flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Other Magnificent 7 Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {magnificent7News && magnificent7News.slice(3).map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                          {item.symbol}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge className={`${item.ai_sentiment === 'Bullish' ? 'bg-emerald-500' : item.ai_sentiment === 'Bearish' ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs`}>
                            {item.ai_sentiment?.toUpperCase()}
                          </Badge>
                          <span className="text-slate-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">AI Predictions</h2>
            <Link to="/predictions">
              <Button variant="link" className="text-emerald-400 hover:text-emerald-300">
                View more →
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 mb-8">Keep up with the latest AI-generated market forecasts</p>
          
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <PredictionCard key={index} {...prediction} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
