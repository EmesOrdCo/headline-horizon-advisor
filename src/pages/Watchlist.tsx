
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";
import ChartModal from "@/components/ChartModal";
import { useUserStockPrices } from "@/hooks/useUserStockPrices";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
}

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; stockName: string } | null>(null);

  // Stock symbols from the mock data
  const watchlistSymbols = ["NVDA", "TSLA", "AMZN", "PLTR", "AAPL", "SOXL", "GOOGL", "MSTR", "META"];
  
  // Get real-time stock prices using the user stocks hook
  const { data: stockPrices, isLoading: pricesLoading } = useUserStockPrices(watchlistSymbols);

  const watchlistData: Stock[] = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 789.25,
      change: 15.75,
      changePercent: 2.03,
      marketCap: "1.94T",
    },
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 1050.50,
      change: -22.30,
      changePercent: -2.07,
      marketCap: "1.01T",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com, Inc.",
      price: 3420.80,
      change: 45.20,
      changePercent: 1.34,
      marketCap: "1.72T",
    },
    {
      symbol: "PLTR",
      name: "Palantir Technologies Inc.",
      price: 27.50,
      change: 0.80,
      changePercent: 3.00,
      marketCap: "52.14B",
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 150.25,
      change: -1.20,
      changePercent: -0.80,
      marketCap: "2.46T",
    },
    {
      symbol: "SOXL",
      name: "Direxion Daily Semiconductor Bull 3x Shares",
      price: 45.67,
      change: 1.23,
      changePercent: 2.76,
      marketCap: "1.23B",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 2700.15,
      change: 30.50,
      changePercent: 1.14,
      marketCap: "1.80T",
    },
    {
      symbol: "MSTR",
      name: "MicroStrategy Incorporated",
      price: 650.75,
      change: -15.25,
      changePercent: -2.29,
      marketCap: "6.12B",
    },
    {
      symbol: "META",
      name: "Meta Platforms, Inc.",
      price: 350.20,
      change: 5.80,
      changePercent: 1.68,
      marketCap: "945.67B",
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
      
      <div className="pt-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
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
                          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{stock.symbol}</div>
                            <div className="text-slate-400 text-sm">{stock.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {pricesLoading ? (
                          <div className="animate-pulse bg-slate-700 w-16 h-4 rounded"></div>
                        ) : (
                          `$${getRealPrice(stock.symbol).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getRealChange(stock.symbol) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {getRealChange(stock.symbol) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{getRealChange(stock.symbol) >= 0 ? '+' : ''}{getRealChangePercent(stock.symbol).toFixed(2)}%</span>
                        </div>
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
            </div>
          </Tabs>
        </div>
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
