
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStockPrices } from "@/hooks/useStockPrices";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

const Magnificent7 = () => {
  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

  const { data: news, isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['news', 'magnificent-7'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .in('symbol', MAGNIFICENT_7)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching news:", error);
        throw new Error(error.message);
      }
      return data;
    },
  });

  const { data: stockPrices, isLoading: pricesLoading } = useStockPrices(MAGNIFICENT_7);

  if (newsError) {
    return <div className="text-red-500">Error: {newsError.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <main className="pt-20 pb-8">
        <div className="w-[95%] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Magnificent 7</h1>
              <Badge className="bg-blue-500 text-white text-xs">AI ANALYSIS</Badge>
            </div>
            <div className="text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Updated every 5 minutes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsLoading ? (
              <div className="text-slate-400">Loading news...</div>
            ) : (
              news?.map((item, index) => {
                const stockPrice = stockPrices?.[item.symbol];
                return (
                  <NewsCard
                    key={index}
                    symbol={item.symbol}
                    title={item.title}
                    description={item.description}
                    confidence={item.ai_confidence}
                    sentiment={item.ai_sentiment}
                    category={item.category}
                    sourceLinks={item.source_links}
                    stockPrice={stockPrice}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Magnificent7;
