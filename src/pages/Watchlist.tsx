
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
import { TrendingUp, TrendingDown, ExternalLink, Loader2, BarChart3, RefreshCw, Crown, Target, BarChart, Bitcoin, Globe, DollarSign, Building, Plus, Clock } from "lucide-react";

import DashboardNav from "@/components/DashboardNav";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import ChartModal from "@/components/ChartModal";
import AddStocksModal from "@/components/AddStocksModal";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { useUserStocks } from "@/hooks/useUserStocks";
import { useStockPrices } from "@/hooks/useStockPrices";
import CompanyLogo from "@/components/CompanyLogo";

import Footer from "@/components/Footer";

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
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; stockName: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("popular");
  const [moversFilter, setMoversFilter] = useState("stocks");
  const [showAddStocksModal, setShowAddStocksModal] = useState(false);

  // Fetch user's actual stocks from database
  const { data: userStocks, isLoading: userStocksLoading, error: userStocksError, refetch: refetchUserStocks } = useUserStocks();
  
  // Extract symbols from user stocks + popular stocks for pricing
  const watchlistSymbols = userStocks?.map(stock => stock.symbol) || [];
  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
  const allSymbols = [...new Set([...watchlistSymbols, ...popularSymbols])]; // Remove duplicates
  
  // Get real-time stock prices for both user's stocks and popular stocks
  const { data: stockPrices, isLoading: pricesLoading } = useStockPrices(allSymbols);
  
  // Get biggest movers data
  const { data: moversData, isLoading: moversLoading, error: moversError, refetch } = useBiggestMovers();
  
  // Get company logos for user's stocks
  const { logos, loading: logosLoading, getLogoUrl } = useCompanyLogos(watchlistSymbols);

  // Get stock names from the API data (fallback names if needed)
  const getStockName = (symbol: string): string => {
    const apiStock = stockPrices?.find((s) => s.symbol === symbol);
    // For now, return a generic name - in the future, we could fetch company names
    return apiStock?.symbol ? `${symbol} Corporation` : symbol;
  };

  const filteredData = (): Stock[] => {
    // For 'popular' category, show predefined popular stocks with live pricing
    if (categoryFilter === 'popular') {
      const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
      
      if (!stockPrices) {
        return [];
      }

      let data: Stock[] = popularSymbols.map(symbol => {
        const priceData = stockPrices.find((s) => s.symbol === symbol);
        
        return {
          symbol: symbol,
          name: getStockName(symbol),
          price: priceData?.price || 0,
          change: priceData?.change || 0,
          changePercent: priceData?.changePercent || 0,
        };
      });
    
      return data;
    }

    // For 'my-stocks' and 'stocks' categories, show user's actual selected stocks
    if (['my-stocks', 'stocks'].includes(categoryFilter)) {
      // Show loading state or empty state
      if (userStocksLoading) {
        return [];
      }

      if (!userStocks || userStocks.length === 0) {
        return [];
      }

      if (!stockPrices) {
        return [];
      }

      let data: Stock[] = userStocks.map(userStock => {
        const priceData = stockPrices.find((s) => s.symbol === userStock.symbol);
        
        return {
          symbol: userStock.symbol,
          name: getStockName(userStock.symbol),
          price: priceData?.price || 0,
          change: priceData?.change || 0,
          changePercent: priceData?.changePercent || 0,
        };
      });
    
      data = data.sort((a, b) => a.symbol.localeCompare(b.symbol));
      return data;
    }

    // Handle other coming soon categories
    if (['crypto', 'indices', 'commodities', 'currencies', 'etfs'].includes(categoryFilter)) {
      return [];
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <div className="pt-16">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
          {/* My Watchlist Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
              <div className="flex items-center gap-3">
                {pricesLoading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading real-time prices...</span>
                  </div>
                )}
                
              </div>
            </div>
            
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-1 overflow-x-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-max">
                  <Button
                    variant={categoryFilter === "popular" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("popular")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "popular" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    Popular
                  </Button>
                  <Button
                    variant={categoryFilter === "my-stocks" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("my-stocks")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "my-stocks" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    My Stocks
                  </Button>
                  <Button
                    variant={categoryFilter === "stocks" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("stocks")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "stocks" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Stocks
                  </Button>
                  <Button
                    variant={categoryFilter === "crypto" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("crypto")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "crypto" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Bitcoin className="w-4 h-4 mr-2" />
                    Crypto
                  </Button>
                  <Button
                    variant={categoryFilter === "indices" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("indices")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "indices" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Indices
                  </Button>
                  <Button
                    variant={categoryFilter === "commodities" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("commodities")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "commodities" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Commodities
                  </Button>
                  <Button
                    variant={categoryFilter === "currencies" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("currencies")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "currencies" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Currencies
                  </Button>
                  <Button
                    variant={categoryFilter === "etfs" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoryFilter("etfs")}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      categoryFilter === "etfs" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    ETFs
                  </Button>
                </div>
                <Button
                  onClick={() => setShowAddStocksModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                >
                  <Plus className="w-4 h-4" />
                  Add Stocks
                </Button>
              </div>
            </div>
          </div>

          {/* Current Watchlist Content */}
          <div className="mb-16">
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
                  {userStocksLoading || pricesLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index} className="border-slate-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 bg-slate-700 rounded" />
                            <div>
                              <Skeleton className="w-16 h-4 bg-slate-700 mb-1" />
                              <Skeleton className="w-24 h-3 bg-slate-700" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="w-16 h-4 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="w-20 h-4 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="w-32 h-16 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="w-20 h-4 bg-slate-700" /></TableCell>
                      </TableRow>
                    ))
                   ) : filteredData().length === 0 ? (
                     // Empty state - different messages based on category
                     <TableRow>
                       <TableCell colSpan={5} className="h-32 text-center">
                          {['crypto', 'indices', 'commodities', 'currencies', 'etfs'].includes(categoryFilter) ? (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <BarChart3 className="w-12 h-12" />
                              <div>
                                <p className="font-medium text-xl text-white">Coming Soon</p>
                                <p className="text-sm">
                                  {categoryFilter === 'crypto' && 'Cryptocurrency tracking is coming soon'}
                                  {categoryFilter === 'indices' && 'Market indices tracking is coming soon'}
                                  {categoryFilter === 'commodities' && 'Commodities tracking is coming soon'}
                                  {categoryFilter === 'currencies' && 'Currency pairs tracking is coming soon'}
                                  {categoryFilter === 'etfs' && 'ETF tracking is coming soon'}
                                </p>
                              </div>
                            </div>
                         ) : (
                           <div className="flex flex-col items-center gap-3 text-slate-400">
                             <BarChart3 className="w-12 h-12" />
                             <div>
                               <p className="font-medium">No stocks in your watchlist</p>
                               <p className="text-sm">Add some stocks to start tracking your portfolio</p>
                             </div>
                            <Button
                              onClick={() => setShowAddStocksModal(true)}
                              className="text-emerald-400 hover:text-emerald-300 underline bg-transparent border-none p-0 h-auto"
                            >
                              Add your first stock →
                            </Button>
                           </div>
                         )}
                       </TableCell>
                     </TableRow>
                  ) : (
                    // Actual stock data
                    filteredData().map((stock) => (
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
                            `$${stock.price.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>
                          {pricesLoading ? (
                            <Skeleton className="w-20 h-4 bg-slate-700" />
                          ) : (
                            <div className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
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
                    ))
                  )}
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
          </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 mb-8 px-4 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Daily Movers</h2>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              Today's biggest gainers and losers.
              <Button
                onClick={() => refetch()}
                disabled={moversLoading}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white p-1"
              >
                <RefreshCw className={`w-3 h-3 ${moversLoading ? 'animate-spin' : ''}`} />
              </Button>
            </span>
          </div>
          
          {/* Full Category Filter for Daily Movers */}
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-1 overflow-x-auto mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-max">
                <Button
                  variant={moversFilter === "stocks" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("stocks")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "stocks" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stocks
                </Button>
                <Button
                  variant={moversFilter === "crypto" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("crypto")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "crypto" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  disabled
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Crypto
                </Button>
                <Button
                  variant={moversFilter === "indices" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("indices")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "indices" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  disabled
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Indices
                </Button>
                <Button
                  variant={moversFilter === "commodities" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("commodities")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "commodities" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  disabled
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Commodities
                </Button>
                <Button
                  variant={moversFilter === "currencies" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("currencies")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "currencies" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  disabled
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Currencies
                </Button>
                <Button
                  variant={moversFilter === "etfs" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMoversFilter("etfs")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    moversFilter === "etfs" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  disabled
                >
                  <Building className="w-4 h-4 mr-2" />
                  ETFs
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-700 ml-4"
              >
                View All
              </Button>
            </div>
          </div>
        </div>

        {moversLoading && (
          <div className="text-center py-8">
            <div className="text-slate-400">Loading market data...</div>
          </div>
        )}

        {moversError && (
          <div className="text-center py-8">
            <div className="text-red-400">{moversError.message}</div>
          </div>
        )}

        {moversFilter !== "stocks" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-8 max-w-md">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
              <p className="text-slate-400">
                {moversFilter.charAt(0).toUpperCase() + moversFilter.slice(1)} market data will be available soon. 
                Stay tuned for updates!
              </p>
            </div>
          </div>
        ) : moversData && !moversLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Gainers */}
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Top Gainers</h3>
              </div>
              <div className="space-y-3">
                {moversData.gainers.slice(0, 5).map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <CompanyLogo 
                          symbol={stock.symbol} 
                          logoUrl={getLogoUrl(stock.symbol)} 
                          size="sm" 
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{stock.symbol}</div>
                        <div className="text-slate-400 text-sm truncate max-w-32">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">+{stock.changePercent.toFixed(2)}%</div>
                      <div className="text-slate-300 text-sm">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Losers */}
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Top Losers</h3>
              </div>
              <div className="space-y-3">
                {moversData.losers.slice(0, 5).map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <CompanyLogo 
                          symbol={stock.symbol} 
                          logoUrl={getLogoUrl(stock.symbol)} 
                          size="sm" 
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{stock.symbol}</div>
                        <div className="text-slate-400 text-sm truncate max-w-32">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">{stock.changePercent.toFixed(2)}%</div>
                      <div className="text-slate-300 text-sm">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
      
      
      {/* Add Stocks Modal */}
      <AddStocksModal 
        open={showAddStocksModal}
        onOpenChange={setShowAddStocksModal}
        onStockAdded={() => refetchUserStocks()} // Refresh user stocks when a new one is added
      />
      
      <Footer />
    </div>
  );
};

export default Watchlist;
