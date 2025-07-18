
import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ExternalLink, BarChart3, RefreshCw, Crown, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { useSEO } from "@/hooks/useSEO";

const MoverCard = ({ stock, isGainer, rank }: { stock: any, isGainer: boolean, rank: number }) => {
  const [showHeadlines, setShowHeadlines] = useState(false);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    return <span className="w-4 h-4 text-center text-xs font-bold text-slate-400">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "border-yellow-400/50 bg-yellow-400/5";
    if (rank === 2) return "border-slate-300/50 bg-slate-300/5";
    if (rank === 3) return "border-amber-600/50 bg-amber-600/5";
    return "border-slate-700";
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'bearish':
        return 'text-red-400 bg-red-500/20';
      case 'neutral':
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="w-3 h-3" />;
      case 'bearish':
        return <TrendingDown className="w-3 h-3" />;
      case 'neutral':
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  return (
    <Card className={`bg-slate-800/50 backdrop-blur hover:border-emerald-500/30 transition-all ${getRankColor(rank)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getRankIcon(rank)}
              <Badge className={`${isGainer ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                {stock.symbol}
              </Badge>
            </div>
            <div>
              <h3 className="text-white font-semibold">{stock.name}</h3>
              <p className="text-slate-400 text-sm">Vol: {stock.volume}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-xl font-bold">${stock.price}</div>
            <div className={`flex items-center gap-1 text-sm ${isGainer ? 'text-emerald-400' : 'text-red-400'}`}>
              {isGainer ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isGainer ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Market Sentiment Section */}
        {stock.marketSentiment && (
          <div className="mb-4 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-slate-300 font-medium text-sm">Market Sentiment</h4>
              <Badge className={`${getSentimentColor(stock.marketSentiment)} flex items-center gap-1 text-xs`}>
                {getSentimentIcon(stock.marketSentiment)}
                {stock.marketSentiment}
              </Badge>
            </div>
            {stock.sentimentReasoning && (
              <p className="text-slate-400 text-xs">{stock.sentimentReasoning}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHeadlines(!showHeadlines)}
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 w-full"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            {showHeadlines ? 'Hide' : 'Show'} Headlines ({stock.headlines?.length || 0})
          </Button>
          <Link to={`/analysis/${stock.symbol}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 w-full"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Detailed Analysis
            </Button>
          </Link>
        </div>

        {stock.overallImpact && (
          <div className="mb-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <h4 className="text-slate-300 font-medium text-sm mb-1">AI Impact Analysis</h4>
            <p className="text-slate-400 text-xs">{stock.overallImpact}</p>
          </div>
        )}

        {showHeadlines && stock.headlines && stock.headlines.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-700">
            <h4 className="text-slate-300 font-medium text-sm">Related Headlines ({stock.headlines.length})</h4>
            {stock.headlines.map((headline: any, index: number) => (
              <a
                key={index}
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <h5 className="text-white font-medium text-sm mb-1 line-clamp-2">
                  {headline.title}
                </h5>
                <p className="text-slate-400 text-xs mb-2">
                  Impact: {headline.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">{headline.publishedAt}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BiggestMovers = () => {
  const { data: moversData, isLoading, error, refetch } = useBiggestMovers();
  
  useSEO({
    title: "Biggest Stock Movers Today",
    description: "Track the biggest stock gainers and losers with AI-powered sentiment analysis. Get real-time market data and detailed analysis of top performing stocks.",
    canonical: "https://yourdomain.com/biggest-movers",
    ogType: "article",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Biggest Stock Movers Today",
      "description": "Real-time tracking of biggest stock gainers and losers",
      "author": {
        "@type": "Organization",
        "name": "MarketSensorAI"
      },
      "publisher": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://yourdomain.com/biggest-movers"
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Biggest Movers</h1>
                <p className="text-slate-400 text-sm sm:text-base">Top 3 biggest gainers and losers with the largest price movements today, analyzed with AI sentiment</p>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              LIVE DATA
            </Badge>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
              AI SENTIMENT
            </Badge>
            {moversData?.lastUpdated && (
              <span className="text-slate-500 text-sm">
                Last updated: {new Date(moversData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center h-screen flex flex-col items-center justify-center">
            <div className="text-white text-lg mb-2">Analyzing comprehensive market data...</div>
            <div className="text-slate-400 text-sm">Processing stock prices and sentiment analysis</div>
          </div>
        )}

        {error && (
          <div className="text-center h-screen flex flex-col items-center justify-center">
            <div className="text-red-400 text-lg mb-2">Error loading data</div>
            <div className="text-slate-400 text-sm">{error.message}</div>
          </div>
        )}

        {moversData && !isLoading && (
          <>
            {/* Top Gainers Section */}
            {moversData.gainers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">Top 3 Gainers</h2>
                  <Badge className="bg-emerald-500 text-white">
                    Ranked by % gain
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {moversData.gainers.map((stock, index) => (
                    <MoverCard key={stock.symbol} stock={stock} isGainer={true} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Top Losers Section */}
            {moversData.losers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">Top 3 Losers</h2>
                  <Badge className="bg-red-500 text-white">
                    Ranked by % loss
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {moversData.losers.map((stock, index) => (
                    <MoverCard key={stock.symbol} stock={stock} isGainer={false} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BiggestMovers;
