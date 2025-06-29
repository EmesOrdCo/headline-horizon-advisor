import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import { useNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { data: newsData, isLoading: newsLoading } = useNews();
  const { data: stockPrices } = useStockPrices([
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'QQQ', 'DIA'
  ]);

  const formatChange = (change: number) => {
    if (change > 0) {
      return `+${change.toFixed(2)}`;
    }
    return change.toFixed(2);
  };

  const formatChangePercent = (changePercent: number) => {
    if (changePercent > 0) {
      return `+${changePercent.toFixed(2)}%`;
    }
    return `${changePercent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <main className="pt-20 pb-8">
        <div className="w-[95%] mx-auto px-6">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome to your Dashboard
                </h1>
                <p className="text-slate-400">
                  Stay informed with the latest market insights.
                </p>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-sm mb-1">
                  Last Updated: <Clock className="inline w-3 h-3 mr-1" /> {new Date().toLocaleTimeString()}
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  AI-Powered Insights
                </Badge>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/my-stocks">
                <Button className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" /> My Stocks
                </Button>
              </Link>
              <Link to="/biggest-movers">
                <Button className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" /> Biggest Movers
                </Button>
              </Link>
              <Link to="/predictions">
                <Button className="w-full justify-start">
                  <Zap className="mr-2 h-4 w-4" /> AI Predictions
                </Button>
              </Link>
            </div>
          </section>

          {/* Live Market News */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Live Market News
            </h2>
            {newsLoading ? (
              <div className="text-slate-400">Loading news...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData?.map((newsItem, index) => {
                  const stockPrice = stockPrices?.find(price => price.symbol === newsItem.symbol);
                  return (
                    <NewsCard
                      key={index}
                      symbol={newsItem.symbol}
                      title={newsItem.title}
                      description={newsItem.description}
                      confidence={newsItem.confidence}
                      sentiment={newsItem.sentiment}
                      category={newsItem.category}
                      isHistorical={newsItem.is_historical}
                      sourceLinks={newsItem.source_links}
                      stockPrice={stockPrice}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
