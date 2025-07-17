
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Watchlist = () => {
  useSEO({
    title: "Watchlist",
    description: "Your personal stock watchlist",
    canonical: "https://yourdomain.com/watchlist",
    ogType: "website",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
            <p className="text-slate-400">Your personal stock watchlist</p>
          </div>
          
          {/* Placeholder content - will be filled later */}
          <div className="text-center text-slate-400 py-12">
            <p>Watchlist content will be added here</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Watchlist;
