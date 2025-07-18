
import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";

const Watchlist = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Mock data for the watchlist
  const watchlistData = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 173.00,
      change: 1.63,
      changePercent: 0.95,
      riskScore: 6,
      consensus: "Strong Buy",
      logo: "🟢" // Placeholder for NVIDIA logo
    },
    {
      symbol: "TSLA",
      name: "Tesla Motors, Inc.",
      price: 319.41,
      change: -2.26,
      changePercent: -0.70,
      riskScore: 6,
      consensus: "Buy",
      logo: "🔴" // Placeholder for Tesla logo
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc",
      price: 223.88,
      change: 0.69,
      changePercent: 0.31,
      riskScore: 5,
      consensus: "Strong Buy",
      logo: "🟡" // Placeholder for Amazon logo
    },
    {
      symbol: "PLTR",
      name: "Palantir Technologies Inc.",
      price: 153.99,
      change: 3.08,
      changePercent: 2.04,
      riskScore: 8,
      consensus: "Hold",
      logo: "⚫" // Placeholder for Palantir logo
    },
    {
      symbol: "AAPL",
      name: "Apple",
      price: 210.02,
      change: -0.14,
      changePercent: -0.07,
      riskScore: 4,
      consensus: "Strong Buy",
      logo: "🍎" // Placeholder for Apple logo
    },
    {
      symbol: "SOXL",
      name: "Direxion Daily Semiconductors Bull 3...",
      price: 27.32,
      change: 0.29,
      changePercent: 1.07,
      riskScore: 9,
      consensus: "Hold",
      logo: "📊" // Placeholder for SOXL logo
    },
    {
      symbol: "GOOGL",
      name: "Alphabet",
      price: 184.70,
      change: 0.93,
      changePercent: 0.51,
      riskScore: 5,
      consensus: "Buy",
      logo: "🔵" // Placeholder for Google logo
    },
    {
      symbol: "MSTR",
      name: "MicroStrategy Incorporated",
      price: 451.34,
      change: -4.56,
      changePercent: -1.00,
      riskScore: 7,
      consensus: "Hold",
      logo: "🟠" // Placeholder for MicroStrategy logo
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc",
      price: 701.41,
      change: -1.50,
      changePercent: -0.21,
      riskScore: 6,
      consensus: "Strong Buy",
      logo: "🔷" // Placeholder for Meta logo
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
                    {watchlistData.map((stock) => (
                      <TableRow key={stock.symbol} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                              {stock.logo}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white text-lg">
                                {stock.symbol}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-sm">
                                {stock.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {stock.price.toFixed(2)}
                          </div>
                          <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          {generateMockChart(stock.change >= 0)}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watchlist;
