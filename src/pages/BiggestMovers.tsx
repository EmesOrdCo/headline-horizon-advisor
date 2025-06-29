import DashboardNav from "@/components/DashboardNav";
import StockCard from "@/components/StockCard";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import Footer from "@/components/Footer";

const BiggestMovers = () => {
  const { data: topGainers, isLoading: gainersLoading, error: gainersError } = useBiggestMovers('gainers');
  const { data: topLosers, isLoading: losersLoading, error: losersError } = useBiggestMovers('losers');

  if (gainersError || losersError) {
    return <div>Error: Could not load data.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <main className="pt-20 pb-8">
        <div className="w-[95%] mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Today's Biggest Movers
            </h1>
            <p className="text-slate-400">
              Track the top performing and underperforming stocks in real-time.
            </p>
          </div>

          {/* Top Gainers Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-emerald-400">
                Top Gainers
              </h2>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Real-time Data</span>
              </div>
            </div>
            {gainersLoading ? (
              <div className="text-slate-400">Loading top gainers...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topGainers && topGainers.map((stock) => (
                  <StockCard
                    key={stock.ticker}
                    ticker={stock.ticker}
                    name={stock.name}
                    price={stock.price}
                    change={stock.change}
                    changePercent={stock.change_percent}
                    trendingIcon={TrendingUp}
                    trendingColor="text-emerald-400"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Top Losers Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-red-400">
                Top Losers
              </h2>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Real-time Data</span>
              </div>
            </div>
            {losersLoading ? (
              <div className="text-slate-400">Loading top losers...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topLosers && topLosers.map((stock) => (
                  <StockCard
                    key={stock.ticker}
                    ticker={stock.ticker}
                    name={stock.name}
                    price={stock.price}
                    change={stock.change}
                    changePercent={stock.change_percent}
                    trendingIcon={TrendingDown}
                    trendingColor="text-red-400"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BiggestMovers;
