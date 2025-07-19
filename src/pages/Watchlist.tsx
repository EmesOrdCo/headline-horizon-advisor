
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";

const Watchlist = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Stock symbols from the mock data
  const watchlistSymbols = ["NVDA", "TSLA", "AMZN", "PLTR", "AAPL", "SOXL", "GOOGL", "MSTR", "META"];
  
  // Get real-time stock prices
  const { data: stockPrices, isLoading: pricesLoading } = useStockPrices(watchlistSymbols);

  // Watchlist data with real prices
  const watchlistData = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      riskScore: 6,
      consensus: "Strong Buy",
      logo: "🟢"
    },
    {
      symbol: "TSLA",
      name: "Tesla Motors, Inc.",
      riskScore: 6,
      consensus: "Buy",
      logo: "🔴"
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc",
      riskScore: 5,
      consensus: "Strong Buy",
      logo: "🟡"
    },
    {
      symbol: "PLTR",
      name: "Palantir Technologies Inc.",
      riskScore: 8,
      consensus: "Hold",
      logo: "⚫"
    },
    {
      symbol: "AAPL",
      name: "Apple",
      riskScore: 4,
      consensus: "Strong Buy",
      logo: "🍎"
    },
    {
      symbol: "SOXL",
      name: "Direxion Daily Semiconductors Bull 3...",
      riskScore: 9,
      consensus: "Hold",
      logo: "📊"
    },
    {
      symbol: "GOOGL",
      name: "Alphabet",
      riskScore: 5,
      consensus: "Buy",
      logo: "🔵"
    },
    {
      symbol: "MSTR",
      name: "MicroStrategy Incorporated",
      riskScore: 7,
      consensus: "Hold",
      logo: "🟠"
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc",
      riskScore: 6,
      consensus: "Strong Buy",
      logo: "🔷"
    }
  ];

  const filters = ["All", "Market Open", "Stocks", "People"];

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case "Strong Buy":
        return "text-green-600 font-semibold";
      case "Buy":
        return "text-green-500 font-medium";
      case "Hold":
        return "text-yellow-600 font-medium";
      default:
        return "text-gray-600";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return "text-green-600 border-green-600";
    if (score <= 6) return "text-yellow-600 border-yellow-600";
    return "text-red-600 border-red-600";
  };

  // Mini chart component for each stock
  const MiniChart = ({ symbol }: { symbol: string }) => {
    const { data: historicalData } = useHistoricalPrices(symbol, '1Day', 7);
    
    if (!historicalData?.data || historicalData.data.length === 0) {
      // Fallback to mock chart if no data
      return generateMockChart(Math.random() > 0.5);
    }

    const chartData = historicalData.data;
    const isPositive = chartData[chartData.length - 1]?.close >= chartData[0]?.close;
    
    // Create SVG path from historical data
    const maxPrice = Math.max(...chartData.map(d => d.close));
    const minPrice = Math.min(...chartData.map(d => d.close));
    const priceRange = maxPrice - minPrice;
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 95; // 0 to 95 to fit within 120px width
      const y = priceRange > 0 ? (1 - ((point.close - minPrice) / priceRange)) * 40 + 5 : 25; // 5 to 45 to fit within 50px height
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="120" height="50" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          className="opacity-70"
        />
        <defs>
          <linearGradient id={`gradient-${symbol}-${isPositive ? 'positive' : 'negative'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <polygon
          points={`0,50 ${points} 95,50`}
          fill={`url(#gradient-${symbol}-${isPositive ? 'positive' : 'negative'})`}
        />
      </svg>
    );
  };

  const generateMockChart = (isPositive: boolean) => {
    const points = [];
    let value = 50;
    for (let i = 0; i < 20; i++) {
      value += (Math.random() - 0.5) * 10;
      value = Math.max(10, Math.min(90, value));
      points.push(`${i * 5},${100 - value}`);
    }
    return (
      <svg width="120" height="50" className="inline-block">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          className="opacity-70"
        />
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points.join(' ')} 100,100`}
          fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNav />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Watchlist
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  +
                </Button>
                <Button variant="outline" size="sm">
                  ≡
                </Button>
                <Button variant="outline" size="sm">
                  ⋮⋮⋮⋮
                </Button>
                <Button variant="outline" size="sm">
                  ⋮
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
              <TabsList className="bg-white dark:bg-slate-800 p-1">
                {filters.map((filter) => (
                  <TabsTrigger
                    key={filter}
                    value={filter}
                    className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900"
                  >
                    {filter}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Watchlist Table */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-0">
                {pricesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading real-time stock data...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 dark:border-slate-700">
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium py-4 w-1/4">Markets</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium py-4 text-right w-1/6">Change 1D</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium py-4 text-center w-1/4">Chart</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium py-4 text-center w-1/6">Risk Score</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium py-4 text-center w-1/6">Consensus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchlistData.map((stock) => {
                        const priceData = stockPrices?.find(p => p.symbol === stock.symbol);
                        
                        return (
                          <TableRow 
                            key={stock.symbol} 
                            className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                          >
                            <TableCell className="py-4">
                              <Link 
                                to={`/stock/${stock.symbol.toLowerCase()}`}
                                className="flex items-center gap-3 group cursor-pointer"
                              >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                                  {stock.logo}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    {stock.symbol}
                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                                    {stock.name}
                                  </div>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              {priceData ? (
                                <>
                                  <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    ${priceData.price.toFixed(2)}
                                  </div>
                                  <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                                    priceData.change >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {priceData.change >= 0 ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4" />
                                    )}
                                    {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
                                  </div>
                                </>
                              ) : (
                                <div className="text-slate-400 text-sm">
                                  Loading...
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <MiniChart symbol={stock.symbol} />
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 border-2 rounded-lg font-bold text-lg ${getRiskScoreColor(stock.riskScore)}`}>
                                {stock.riskScore}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <div className={`font-medium ${getConsensusColor(stock.consensus)}`}>
                                {stock.consensus}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watchlist;
