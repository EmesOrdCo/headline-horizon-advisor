
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ExternalLink, Loader2, BarChart3, RefreshCw, Crown, Target } from "lucide-react";
import MarketTicker from "@/components/MarketTicker";
import DashboardNav from "@/components/DashboardNav";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import ChartModal from "@/components/ChartModal";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import CompanyLogo from "@/components/CompanyLogo";
import { LogoPopulationTrigger } from "@/components/LogoPopulationTrigger";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

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

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; stockName: string } | null>(null);

  // Stock symbols from the mock data
  const watchlistSymbols = ["NVDA", "TSLA", "AMZN", "PLTR", "AAPL", "SOXL", "GOOGL", "MSTR", "META"];
  
  // Get real-time stock prices using the user stocks hook
  const { data: stockPrices, isLoading: pricesLoading } = useUserStockPrices(watchlistSymbols);
  
  // Get biggest movers data
  const { data: moversData, isLoading: moversLoading, error: moversError, refetch } = useBiggestMovers();
  
  // Get company logos
  const { logos, loading: logosLoading, getLogoUrl } = useCompanyLogos(watchlistSymbols);

  const watchlistData: Stock[] = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 789.25,
      change: 15.75,
      changePercent: 2.03,
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 1050.50,
      change: -22.30,
      changePercent: -2.07,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com, Inc.",
      price: 3420.80,
      change: 45.20,
      changePercent: 1.34,
    },
    {
      symbol: "PLTR",
      name: "Palantir Technologies Inc.",
      price: 27.50,
      change: 0.80,
      changePercent: 3.00,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 150.25,
      change: -1.20,
      changePercent: -0.80,
    },
    {
      symbol: "SOXL",
      name: "Direxion Daily Semiconductor Bull 3x Shares",
      price: 45.67,
      change: 1.23,
      changePercent: 2.76,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 2700.15,
      change: 30.50,
      changePercent: 1.14,
    },
    {
      symbol: "MSTR",
      name: "MicroStrategy Incorporated",
      price: 650.75,
      change: -15.25,
      changePercent: -2.29,
    },
    {
      symbol: "META",
      name: "Meta Platforms, Inc.",
      price: 350.20,
      change: 5.80,
      changePercent: 1.68,
    },
  ];

  const getRealPrice = (symbol: string): number => {
    const stock = stockPrices?.find((s) => s.symbol === symbol);
    return stock ? stock.price : watchlistData.find((s) => s.symbol === symbol)?.price || 0;
  };

  const getRealChange = (symbol: string): number => {
    const stock = stockPrices?.find((s) => s.symbol === symbol);
    return stock ? stock.change : watchlistData.find((s) => s.symbol === symbol)?.change || 0;
  };

  const getRealChangePercent = (symbol: string): number => {
    const stock = stockPrices?.find((s) => s.symbol === symbol);
    return stock ? stock.changePercent : watchlistData.find((s) => s.symbol === symbol)?.changePercent || 0;
  };

  const filteredData = () => {
    if (!stockPrices && pricesLoading) {
      return watchlistData; // Show mock data structure while loading
    }

    if (!stockPrices) {
      return [];
    }
  
    let data = watchlistData.map(stock => {
      const realPrice = getRealPrice(stock.symbol);
      const realChange = getRealChange(stock.symbol);
      const realChangePercent = getRealChangePercent(stock.symbol);
  
      return {
        ...stock,
        price: realPrice,
        change: realChange,
        changePercent: realChangePercent,
      };
    });
  
    if (activeTab === "gainers") {
      data = data.sort((a, b) => b.change - a.change);
      return data.filter((stock) => stock.change > 0);
    } else if (activeTab === "losers") {
      data = data.sort((a, b) => a.change - b.change);
      return data.filter((stock) => stock.change < 0);
    } else {
      return data;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
              {pricesLoading && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading real-time prices...</span>
                </div>
              )}
            </div>
            <LogoPopulationTrigger />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600">All Stocks</TabsTrigger>
              <TabsTrigger value="gainers" className="data-[state=active]:bg-emerald-600">Gainers</TabsTrigger>
              <TabsTrigger value="losers" className="data-[state=active]:bg-emerald-600">Losers</TabsTrigger>
            </TabsList>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/20">
                    <TableHead className="text-slate-400">Symbol</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400">Change</TableHead>
                    <TableHead className="text-slate-400">Chart (1W)</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData().map((stock) => (
                    <TableRow key={stock.symbol} className="border-slate-700 hover:bg-slate-700/30">
                       <TableCell>
                         <div className="flex items-center gap-3">
                           <CompanyLogo 
                             symbol={stock.symbol} 
                             logoUrl={getLogoUrl(stock.symbol)} 
                             size="md" 
                           />
                           <div>
                             <div className="font-medium text-white">{stock.symbol}</div>
                             <div className="text-slate-400 text-sm">{stock.name}</div>
                           </div>
                         </div>
                       </TableCell>
                      <TableCell className="text-white font-semibold">
                        {pricesLoading ? (
                          <Skeleton className="w-16 h-4 bg-slate-700" />
                        ) : (
                          `$${getRealPrice(stock.symbol).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {pricesLoading ? (
                          <Skeleton className="w-20 h-4 bg-slate-700" />
                        ) : (
                          <div className={`flex items-center gap-1 ${getRealChange(stock.symbol) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {getRealChange(stock.symbol) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{getRealChange(stock.symbol) >= 0 ? '+' : ''}{getRealChangePercent(stock.symbol).toFixed(2)}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div 
                          className="w-32 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedChart({ symbol: stock.symbol, stockName: stock.name })}
                        >
                          <HistoricalPriceChart 
                            symbol={stock.symbol} 
                            timeframe="1Day"
                            limit={7}
                            height={64}
                            showMiniChart={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          to={`/stock/${stock.symbol.toLowerCase()}`}
                          state={{ from: 'watchlist' }}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

               {(pricesLoading || logosLoading) && (
                 <div className="p-6 text-center border-t border-slate-700">
                   <div className="flex items-center justify-center gap-2 text-slate-400">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>
                       {pricesLoading && logosLoading ? 'Loading prices and logos...' : 
                        pricesLoading ? 'Fetching real-time stock prices from Alpaca API...' : 
                        'Loading company logos...'}
                     </span>
                   </div>
                   <p className="text-slate-500 text-sm mt-2">This may take up to 10 seconds</p>
                 </div>
               )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Biggest Movers Section */}
      <div className="max-w-7xl mx-auto mt-16 mb-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Biggest Movers</h2>
                <p className="text-slate-400 text-sm sm:text-base">Top 3 biggest gainers and losers with the largest price movements today, analyzed with AI sentiment</p>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={moversLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${moversLoading ? 'animate-spin' : ''}`} />
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

        {moversLoading && (
          <div className="text-center py-12">
            <div className="text-white text-lg mb-2">Analyzing comprehensive market data...</div>
            <div className="text-slate-400 text-sm">Processing stock prices and sentiment analysis</div>
          </div>
        )}

        {moversError && (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-2">Error loading data</div>
            <div className="text-slate-400 text-sm">{moversError.message}</div>
          </div>
        )}

        {moversData && !moversLoading && (
          <>
            {/* Top Gainers Section */}
            {moversData.gainers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-2xl font-bold text-white">Top 3 Gainers</h3>
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
                  <h3 className="text-2xl font-bold text-white">Top 3 Losers</h3>
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

      {/* Chart Modal */}
      {selectedChart && (
        <ChartModal
          isOpen={!!selectedChart}
          onClose={() => setSelectedChart(null)}
          symbol={selectedChart.symbol}
          stockName={selectedChart.stockName}
        />
      )}
    </div>
  );
};

export default Watchlist;
