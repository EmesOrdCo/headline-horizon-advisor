
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
import { TrendingUp, TrendingDown, ExternalLink, Loader2, BarChart3, RefreshCw, Crown, Target, BarChart, Bitcoin, Globe, DollarSign, Building } from "lucide-react";
import MarketTicker from "@/components/MarketTicker";
import DashboardNav from "@/components/DashboardNav";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import ChartModal from "@/components/ChartModal";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";
import { useBiggestMovers } from "@/hooks/useBiggestMovers";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { useUserStocks } from "@/hooks/useUserStocks";
import { useStockPrices } from "@/hooks/useStockPrices";
import CompanyLogo from "@/components/CompanyLogo";
import { LogoPopulationTrigger } from "@/components/LogoPopulationTrigger";
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
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; stockName: string } | null>(null);
  const [moversFilter, setMoversFilter] = useState("overview");

  // Fetch user's actual stocks from database
  const { data: userStocks, isLoading: userStocksLoading, error: userStocksError } = useUserStocks();
  
  // Extract symbols from user stocks
  const watchlistSymbols = userStocks?.map(stock => stock.symbol) || [];
  
  // Get real-time stock prices for user's stocks
  const { data: stockPrices, isLoading: pricesLoading } = useStockPrices(watchlistSymbols);
  
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
  
    // Create stock data from user's actual stocks and real price data
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
  
    // Filter based on active tab
    if (activeTab === "gainers") {
      data = data.filter((stock) => stock.change > 0);
      data = data.sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === "losers") {
      data = data.filter((stock) => stock.change < 0);
      data = data.sort((a, b) => a.changePercent - b.changePercent);
    } else {
      // Sort by symbol for consistent ordering
      data = data.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    
    return data;
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
                  {userStocksLoading ? (
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
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <BarChart3 className="w-12 h-12" />
                          <div>
                            <p className="font-medium">No stocks in your watchlist</p>
                            <p className="text-sm">
                              {activeTab === "gainers" 
                                ? "No stocks with positive gains today" 
                                : activeTab === "losers" 
                                  ? "No stocks with losses today"
                                  : "Add some stocks to start tracking your portfolio"
                              }
                            </p>
                          </div>
                          {activeTab === "all" && (
                            <Link 
                              to="/my-stocks" 
                              className="text-emerald-400 hover:text-emerald-300 underline"
                            >
                              Add your first stock →
                            </Link>
                          )}
                        </div>
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

          {/* Filter Bar */}
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-1 mt-6 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              <Button
                variant={moversFilter === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMoversFilter("overview")}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  moversFilter === "overview" 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <BarChart className="w-4 h-4 mr-2" />
                Overview
              </Button>
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
              >
                <Building className="w-4 h-4 mr-2" />
                ETFs
              </Button>
            </div>
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
            {moversFilter === "overview" || moversFilter === "stocks" ? (
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
            ) : (
              /* Placeholder for other asset types */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                  <p className="text-slate-400">
                    {moversFilter === "crypto" && "Cryptocurrency movers will be available soon."}
                    {moversFilter === "indices" && "Index fund movers will be available soon."}
                    {moversFilter === "commodities" && "Commodities movers will be available soon."}
                    {moversFilter === "currencies" && "Currency pair movers will be available soon."}
                    {moversFilter === "etfs" && "ETF movers will be available soon."}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Currently showing stock market data only. More asset types coming in future updates.
                  </p>
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
      
      <Footer />
    </div>
  );
};

export default Watchlist;
