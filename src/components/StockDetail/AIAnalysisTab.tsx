
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import NewsCard from "@/components/NewsCard";
import AINewsInsights from "./AINewsInsights";

interface AIAnalysisTabProps {
  symbol: string;
  stockInfo: {
    price: number;
    change: number;
    changePercent: number;
  };
}

const AIAnalysisTab = ({ symbol, stockInfo }: AIAnalysisTabProps) => {
  // Fetch news articles for this specific stock
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('symbol', symbol)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching news articles:', error);
        throw error;
      }

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="text-center py-12">
            <p className="text-slate-400">Loading news analysis...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!newsArticles || newsArticles.length === 0) {
    return (
      <div className="space-y-6">
        <AINewsInsights symbol={symbol} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">AI News Analysis for {symbol}</h2>
      
      {newsArticles.map((article) => (
        <NewsCard
          key={article.id}
          symbol={article.symbol}
          title={article.title}
          description={article.description}
          confidence={article.ai_confidence}
          sentiment={article.ai_sentiment}
          category={article.category}
          sourceLinks={article.source_links}
          isHistorical={article.title?.includes('Historical')}
          stockPrice={{
            price: stockInfo.price,
            change: stockInfo.change,
            changePercent: stockInfo.changePercent
          }}
        />
      ))}
    </div>
  );
};

export default AIAnalysisTab;
