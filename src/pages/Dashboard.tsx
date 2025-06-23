
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import PredictionCard from "@/components/PredictionCard";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import RefreshNewsButton from "@/components/RefreshNewsButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNewsData } from "@/hooks/useNewsData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: newsArticles, isLoading, error } = useNewsData();

  // Transform news data for PredictionCard
  const predictions = newsArticles
    ?.filter(article => article.ai_prediction && article.ai_confidence)
    .slice(0, 3)
    .map(article => {
      const change = parseFloat(article.ai_prediction?.replace(/[+%]/g, '') || '0');
      const current = Math.random() * 500 + 100; // Mock current price
      const predicted = current + (current * change / 100);
      
      return {
        symbol: article.symbol,
        current: parseFloat(current.toFixed(2)),
        predicted: parseFloat(predicted.toFixed(2)),
        change: change,
        confidence: article.ai_confidence || 50,
        timeframe: "24h"
      };
    }) || [];

  // Get featured article (first one with high priority)
  const featuredArticle = newsArticles?.find(article => article.priority === 'HIGH') || newsArticles?.[0];

  // Get other articles for sidebar
  const otherArticles = newsArticles?.slice(1) || [];

  if (error) {
    console.error('Error loading news:', error);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-slate-400 text-sm">AI-Powered Analysis</span>
              </div>
            </div>
            <RefreshNewsButton />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[300px] bg-slate-800" />
                <Skeleton className="h-[200px] bg-slate-800" />
              </div>
            ) : featuredArticle ? (
              <NewsCard
                symbol={featuredArticle.symbol}
                priority={featuredArticle.priority}
                title={featuredArticle.title}
                description={featuredArticle.description}
                prediction={featuredArticle.ai_prediction}
                confidence={featuredArticle.ai_confidence}
                sentiment={featuredArticle.ai_sentiment}
                category={featuredArticle.category}
              />
            ) : (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <p className="text-slate-400">No news articles available. Click "Refresh News" to fetch the latest headlines.</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-[600px] flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Other Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, i) => (
                      <Skeleton key={i} className="h-[100px] bg-slate-800" />
                    ))
                  ) : otherArticles.length > 0 ? (
                    otherArticles.map((article, index) => (
                      <div key={article.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                            {article.symbol}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            {article.ai_sentiment && (
                              <Badge className={`${article.ai_sentiment === 'Bullish' ? 'bg-emerald-500' : article.ai_sentiment === 'Bearish' ? 'bg-red-500' : 'bg-slate-500'} text-white text-xs`}>
                                {article.ai_sentiment.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-slate-400">
                              {article.published_at ? new Date(article.published_at).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No additional headlines available.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <AnalysisPipeline />
        
        {predictions.length > 0 && (
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
