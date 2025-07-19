import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, TrendingDown, Eye, BarChart3, PieChart, List } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Dummy portfolio data
const dummyPortfolioData = {
  totalValue: 125847.32,
  totalGain: 8234.56,
  totalGainPercent: 7.01,
  dayChange: -342.18,
  dayChangePercent: -0.27,
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 25,
      avgCost: 180.50,
      currentPrice: 195.23,
      totalValue: 4880.75,
      gain: 368.25,
      gainPercent: 8.15,
      dayChange: -2.34,
      dayChangePercent: -1.18,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 8,
      avgCost: 2650.00,
      currentPrice: 2789.45,
      totalValue: 22315.60,
      gain: 1115.60,
      gainPercent: 5.26,
      dayChange: 15.23,
      dayChangePercent: 0.55,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 15,
      avgCost: 320.75,
      currentPrice: 342.18,
      totalValue: 5132.70,
      gain: 321.45,
      gainPercent: 6.68,
      dayChange: -4.56,
      dayChangePercent: -1.31,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 12,
      avgCost: 245.80,
      currentPrice: 267.90,
      totalValue: 3214.80,
      gain: 265.20,
      gainPercent: 8.98,
      dayChange: 8.45,
      dayChangePercent: 3.26,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 6,
      avgCost: 420.15,
      currentPrice: 498.72,
      totalValue: 2992.32,
      gain: 471.42,
      gainPercent: 18.71,
      dayChange: 12.34,
      dayChangePercent: 2.54,
    },
  ],
};

type ViewMode = 'cards' | 'table' | 'chart';

const Portfolio = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  useSEO({
    title: "My Portfolio",
    description: "Track your investment portfolio performance with detailed analytics and insights.",
    canonical: "https://yourdomain.com/portfolio",
    ogType: "website",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Portfolio Summary Component
  const PortfolioSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(dummyPortfolioData.totalValue)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Total Gain/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            dummyPortfolioData.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {dummyPortfolioData.totalGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {formatCurrency(dummyPortfolioData.totalGain)}
          </div>
          <div className={`text-sm ${dummyPortfolioData.totalGainPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(dummyPortfolioData.totalGainPercent)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Day Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            dummyPortfolioData.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {dummyPortfolioData.dayChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {formatCurrency(dummyPortfolioData.dayChange)}
          </div>
          <div className={`text-sm ${dummyPortfolioData.dayChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(dummyPortfolioData.dayChangePercent)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {dummyPortfolioData.holdings.length}
          </div>
          <div className="text-sm text-slate-400">Positions</div>
        </CardContent>
      </Card>
    </div>
  );

  // Cards View
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {dummyPortfolioData.holdings.map((holding) => (
        <Card key={holding.symbol} className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-emerald-600 text-white mb-2">{holding.symbol}</Badge>
                <CardTitle className="text-white text-lg">{holding.name}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {formatCurrency(holding.currentPrice)}
                </div>
                <div className={`text-sm flex items-center gap-1 ${
                  holding.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {holding.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatCurrency(holding.dayChange)} ({formatPercent(holding.dayChangePercent)})
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Shares</div>
                <div className="text-white font-semibold">{holding.shares}</div>
              </div>
              <div>
                <div className="text-slate-400">Avg Cost</div>
                <div className="text-white font-semibold">{formatCurrency(holding.avgCost)}</div>
              </div>
              <div>
                <div className="text-slate-400">Total Value</div>
                <div className="text-white font-semibold">{formatCurrency(holding.totalValue)}</div>
              </div>
              <div>
                <div className="text-slate-400">Gain/Loss</div>
                <div className={`font-semibold flex items-center gap-1 ${holding.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {holding.gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatCurrency(holding.gain)} ({formatPercent(holding.gainPercent)})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Table View
  const TableView = () => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700">
              <tr className="text-left">
                <th className="p-4 text-slate-400 font-medium">Symbol</th>
                <th className="p-4 text-slate-400 font-medium">Name</th>
                <th className="p-4 text-slate-400 font-medium">Shares</th>
                <th className="p-4 text-slate-400 font-medium">Avg Cost</th>
                <th className="p-4 text-slate-400 font-medium">Current Price</th>
                <th className="p-4 text-slate-400 font-medium">Total Value</th>
                <th className="p-4 text-slate-400 font-medium">Gain/Loss</th>
                <th className="p-4 text-slate-400 font-medium">Day Change</th>
              </tr>
            </thead>
            <tbody>
              {dummyPortfolioData.holdings.map((holding) => (
                <tr key={holding.symbol} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="p-4">
                    <Badge className="bg-emerald-600 text-white">{holding.symbol}</Badge>
                  </td>
                  <td className="p-4 text-white">{holding.name}</td>
                  <td className="p-4 text-white">{holding.shares}</td>
                  <td className="p-4 text-white">{formatCurrency(holding.avgCost)}</td>
                  <td className="p-4 text-white font-semibold">{formatCurrency(holding.currentPrice)}</td>
                  <td className="p-4 text-white font-semibold">{formatCurrency(holding.totalValue)}</td>
                  <td className={`p-4 font-semibold ${holding.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="flex items-center gap-1">
                      {holding.gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatCurrency(holding.gain)}
                    </div>
                    <div className="text-sm">({formatPercent(holding.gainPercent)})</div>
                  </td>
                  <td className={`p-4 ${holding.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="flex items-center gap-1">
                      {holding.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatCurrency(holding.dayChange)}
                    </div>
                    <div className="text-sm">({formatPercent(holding.dayChangePercent)})</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // Chart View with Pie Chart
  const ChartView = () => {
    // Calculate percentages that add up to exactly 100%
    const totalValue = dummyPortfolioData.totalValue;
    let runningTotal = 0;
    
    const chartData = dummyPortfolioData.holdings.map((holding, index) => {
      const isLast = index === dummyPortfolioData.holdings.length - 1;
      let percentage;
      
      if (isLast) {
        // Last item gets the remainder to ensure total is exactly 100%
        percentage = 100 - runningTotal;
      } else {
        percentage = (holding.totalValue / totalValue) * 100;
        runningTotal += percentage;
      }
      
      return {
        name: holding.symbol,
        value: holding.totalValue,
        percentage: percentage,
        fullName: holding.name,
        dayChange: holding.dayChange,
        dayChangePercent: holding.dayChangePercent,
        color: `hsl(${(index * 60) % 360}, 70%, 60%)`, // Generate different colors
      };
    });

    const chartConfig = {
      value: {
        label: "Portfolio Value",
      },
    };

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
            <p className="text-white font-semibold">{data.name}</p>
            <p className="text-slate-300 text-sm">{data.fullName}</p>
            <p className="text-emerald-400 font-semibold">
              {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
            </p>
            <p className={`text-sm flex items-center gap-1 ${
              data.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {data.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              Day: {formatCurrency(data.dayChange)} ({formatPercent(data.dayChangePercent)})
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Allocation</CardTitle>
          <p className="text-slate-400 text-sm">Distribution of your investments</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pie Chart - Takes up 1 column */}
            <div className="flex justify-center items-center">
              <ChartContainer config={chartConfig} className="h-80 w-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Holdings Breakdown - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-white font-semibold text-xl mb-6">Holdings Breakdown</h3>
              <div className="space-y-3">
                {chartData.map((holding, index) => (
                  <div key={holding.name} className="bg-slate-700/40 rounded-lg px-4 py-3 border border-slate-600/50 hover:bg-slate-700/60 transition-colors">
                    {/* Single horizontal line layout */}
                    <div className="flex items-center justify-between gap-6 w-full">
                      <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: holding.color }}
                        />
                        <Badge className="bg-emerald-600 text-white text-xs font-medium px-2 py-1 flex-shrink-0">
                          {holding.name}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0 px-4">
                        <p className="text-slate-300 text-sm font-medium truncate">
                          {holding.fullName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-8 flex-shrink-0">
                        <div className="text-center min-w-0">
                          <p className="text-slate-400 text-xs">Value</p>
                          <p className="text-white font-semibold text-sm">
                            {formatCurrency(holding.value)}
                          </p>
                        </div>
                        <div className="text-center min-w-0">
                          <p className="text-slate-400 text-xs">Change</p>
                          <div className={`flex items-center justify-center gap-1 text-sm font-medium ${
                            holding.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {holding.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercent(holding.dayChangePercent)}
                          </div>
                        </div>
                        <div className="text-center min-w-0">
                          <p className="text-slate-400 text-xs">Allocation</p>
                          <div className="text-white font-bold text-lg">
                            {holding.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
                <p className="text-slate-400">Track your investment performance with detailed analytics</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode('cards')}
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  className={viewMode === 'cards' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Cards
                </Button>
                <Button
                  onClick={() => setViewMode('table')}
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  className={viewMode === 'table' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}
                >
                  <List className="w-4 h-4 mr-2" />
                  Table
                </Button>
                <Button
                  onClick={() => setViewMode('chart')}
                  variant={viewMode === 'chart' ? 'default' : 'outline'}
                  size="sm"
                  className={viewMode === 'chart' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  Chart
                </Button>
              </div>
            </div>
            
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium">Demo Mode</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                This portfolio uses dummy data for demonstration. Connect your brokerage account to see real positions.
              </p>
            </div>
          </div>

          <PortfolioSummary />

          <div className="mb-8">
            {viewMode === 'cards' && <CardsView />}
            {viewMode === 'table' && <TableView />}
            {viewMode === 'chart' && <ChartView />}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Portfolio;
