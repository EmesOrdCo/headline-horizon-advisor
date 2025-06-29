
import { Card, CardContent } from "@/components/ui/card";
import NewsCard from "@/components/NewsCard";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface NewsArticle {
  id: string;
  symbol: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  ai_sentiment: string;
  ai_confidence: number;
  ai_reasoning: string;
  source_links: string;
  category?: string;
}

interface NewsAnalysisDisplayProps {
  userStocks: UserStock[];
  newsArticles: NewsArticle[];
  stockPrices?: StockPrice[];
}

const NewsAnalysisDisplay = ({ userStocks, newsArticles, stockPrices }: NewsAnalysisDisplayProps) => {
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(price => price.symbol === symbol);
  };

  if (userStocks.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="text-center py-12">
          <p className="text-slate-400 mb-4">No stocks selected yet</p>
          <p className="text-sm text-slate-500">Search and add up to 3 stocks to start tracking and analyzing Marketaux news</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Marketaux News Analysis</h2>
      
      {userStocks.map((stock) => {
        const stockArticles = newsArticles.filter(article => article.symbol === stock.symbol);
        const stockPrice = getStockPrice(stock.symbol);
        
        if (stockArticles.length === 0) {
          return (
            <Card key={stock.symbol} className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <p className="text-slate-400 mb-4">No analysis available for {stock.symbol}</p>
                <p className="text-sm text-slate-500">Click "Analyze Stocks" to fetch latest Marketaux news</p>
              </CardContent>
            </Card>
          );
        }

        return (
          <div key={stock.symbol} className="space-y-4">
            {stockArticles.map((article) => (
              <NewsCard
                key={article.id}
                symbol={article.symbol}
                title={article.title}
                description={article.description}
                confidence={article.ai_confidence}
                sentiment={article.ai_sentiment}
                category={article.category}
                sourceLinks={article.source_links}
                stockPrice={stockPrice ? {
                  price: stockPrice.price,
                  change: stockPrice.change,
                  changePercent: stockPrice.changePercent
                } : undefined}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default NewsAnalysisDisplay;
