import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Dummy portfolio data
const portfolioData = {
  totalValue: { USD: 125847.32, GBP: 99678.90, EUR: 117234.56 },
  totalDeposited: { USD: 110000.00, GBP: 87200.45, EUR: 102500.80 },
  availableCash: { USD: 5847.32, GBP: 4628.90, EUR: 5434.56 },
  invested: { USD: 120000.00, GBP: 95050.00, EUR: 111800.00 },
  dayChange: { USD: -342.18, GBP: -271.34, EUR: -318.45 },
  dayChangePercent: { USD: -0.27, GBP: -0.27, EUR: -0.27 },
  totalReturn: { USD: 15847.32, GBP: 12578.45, EUR: 14733.76 },
  totalReturnPercent: { USD: 14.41, GBP: 14.42, EUR: 14.38 },
};

const performanceData = [
  { date: '2024-01', value: 95000, sp500: 4200, nasdaq: 13000, btc: 42000 },
  { date: '2024-02', value: 98500, sp500: 4350, nasdaq: 13500, btc: 48000 },
  { date: '2024-03', value: 102000, sp500: 4500, nasdaq: 14000, btc: 52000 },
  { date: '2024-04', value: 106500, sp500: 4650, nasdaq: 14500, btc: 58000 },
  { date: '2024-05', value: 112000, sp500: 4800, nasdaq: 15000, btc: 62000 },
  { date: '2024-06', value: 118500, sp500: 4950, nasdaq: 15500, btc: 65000 },
  { date: '2024-07', value: 125847, sp500: 5100, nasdaq: 16000, btc: 67000 },
];

const assetCategories = {
  stocks: [
    { symbol: "AAPL", name: "Apple Inc.", investment: 25000, currentValue: 28750, change: 15.0, dayChange: -1.2, logo: "🍎" },
    { symbol: "GOOGL", name: "Alphabet Inc.", investment: 20000, currentValue: 22400, change: 12.0, dayChange: 0.8, logo: "🔍" },
    { symbol: "MSFT", name: "Microsoft Corp.", investment: 18000, currentValue: 19980, change: 11.0, dayChange: -0.5, logo: "🖥️" },
    { symbol: "TSLA", name: "Tesla Inc.", investment: 15000, currentValue: 18300, change: 22.0, dayChange: 3.2, logo: "🚗" },
    { symbol: "NVDA", name: "NVIDIA Corp.", investment: 12000, currentValue: 16800, change: 40.0, dayChange: 2.1, logo: "🎮" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin", investment: 8000, currentValue: 9120, change: 14.0, dayChange: -2.3, logo: "₿" },
    { symbol: "ETH", name: "Ethereum", investment: 5000, currentValue: 5650, change: 13.0, dayChange: -1.8, logo: "Ξ" },
    { symbol: "SOL", name: "Solana", investment: 3000, currentValue: 3720, change: 24.0, dayChange: 4.2, logo: "◎" },
  ],
  funds: [
    { symbol: "SPY", name: "SPDR S&P 500 ETF", investment: 10000, currentValue: 10800, change: 8.0, dayChange: -0.3, logo: "📊" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", investment: 8000, currentValue: 8720, change: 9.0, dayChange: 0.2, logo: "📈" },
  ]
};

const tradeHistory = [
  { asset: "AAPL", type: "BUY", quantity: 50, price: 180.50, date: "2024-07-15", time: "09:30", gainLoss: 750.00 },
  { asset: "GOOGL", type: "BUY", quantity: 10, price: 2650.00, date: "2024-07-12", time: "14:22", gainLoss: 400.00 },
  { asset: "BTC", type: "BUY", quantity: 0.2, price: 62000.00, date: "2024-07-10", time: "16:45", gainLoss: 340.00 },
  { asset: "TSLA", type: "SELL", quantity: 25, price: 267.90, date: "2024-07-08", time: "11:15", gainLoss: -125.00 },
  { asset: "MSFT", type: "BUY", quantity: 30, price: 342.18, date: "2024-07-05", time: "10:30", gainLoss: 580.00 },
  { asset: "ETH", type: "BUY", quantity: 2.5, price: 3200.00, date: "2024-07-03", time: "13:20", gainLoss: 200.00 },
  { asset: "NVDA", type: "BUY", quantity: 15, price: 498.72, date: "2024-07-01", time: "15:45", gainLoss: 920.00 },
];

const Portfolio = () => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [benchmarkType, setBenchmarkType] = useState<'sp500' | 'nasdaq' | 'btc'>('sp500');
  
  useSEO({
    title: "Portfolio - Investment Tracker",
    description: "Track your investment portfolio performance with detailed analytics and insights.",
    canonical: "https://yourdomain.com/portfolio",
    ogType: "website",
  });

  const formatCurrency = (value: number, currency: string = selectedCurrency) => {
    const currencySymbols = { USD: '$', GBP: '£', EUR: '€' };
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Account Summary Component
  const AccountSummary = () => {
    const data = portfolioData;
    
    return (
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Account Summary</h2>
          <Select value={selectedCurrency} onValueChange={(value: 'USD' | 'GBP' | 'EUR') => setSelectedCurrency(value)}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Account Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(data.totalValue[selectedCurrency])}
              </div>
              <p className="text-xs text-slate-400 mt-1">All investments & cash</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(data.invested[selectedCurrency])}
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently placed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Available Cash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(data.availableCash[selectedCurrency])}
              </div>
              <p className="text-xs text-slate-400 mt-1">Ready to invest</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overall Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.totalReturn[selectedCurrency] >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.totalReturn[selectedCurrency])}
              </div>
              <p className={`text-xs mt-1 ${data.totalReturnPercent[selectedCurrency] >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(data.totalReturnPercent[selectedCurrency])}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Asset Breakdown and Performance Component
  const AssetBreakdownAndPerformance = () => {
    const allAssets = [...assetCategories.stocks, ...assetCategories.crypto, ...assetCategories.funds];
    const totalValue = allAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const pieData = allAssets.map((asset, index) => ({
      name: asset.symbol,
      value: asset.currentValue,
      percentage: ((asset.currentValue / totalValue) * 100).toFixed(1),
      color: `hsl(${(index * 45) % 360}, 70%, 60%)`
    }));

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Asset Categories - Left Side (Smaller) */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(assetCategories).map(([category, assets]) => (
              <Card key={category} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white capitalize text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div key={asset.symbol} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{asset.logo}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-600 text-white text-xs">{asset.symbol}</Badge>
                              <span className="text-white text-sm font-medium">{asset.name}</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Invested: {formatCurrency(asset.investment)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{formatCurrency(asset.currentValue)}</div>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className={`flex items-center gap-1 ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {asset.change >= 0 ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                              {formatPercent(asset.change)}
                            </span>
                            <span className={`${asset.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPercent(asset.dayChange)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Chart and Pie Chart - Right Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Performance Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Performance Over Time</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={showBenchmark} onCheckedChange={setShowBenchmark} />
                      <span className="text-sm text-slate-400">Compare to benchmark</span>
                    </div>
                    {showBenchmark && (
                      <Select value={benchmarkType} onValueChange={(value: 'sp500' | 'nasdaq' | 'btc') => setBenchmarkType(value)}>
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sp500">S&P 500</SelectItem>
                          <SelectItem value="nasdaq">NASDAQ</SelectItem>
                          <SelectItem value="btc">Bitcoin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Portfolio Value" } }} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#F1F5F9' }}
                        formatter={(value: number, name: string) => [
                          name === 'value' ? formatCurrency(value) : `$${value.toLocaleString()}`,
                          name === 'value' ? 'Portfolio' : name.toUpperCase()
                        ]}
                      />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                      {showBenchmark && (
                        <Line 
                          type="monotone" 
                          dataKey={benchmarkType} 
                          stroke="#6366F1" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={{ fill: '#6366F1', strokeWidth: 2, r: 3 }} 
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Portfolio Allocation Pie Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Value" } }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        labelLine={{
                          stroke: '#9CA3AF',
                          strokeWidth: 1,
                        }}
                        fontSize={12}
                        fill="#F1F5F9"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };


  // All-Time Returns Component
  const AllTimeReturns = () => {
    const data = portfolioData;
    const totalDeposited = data.totalDeposited[selectedCurrency];
    const currentValue = data.totalValue[selectedCurrency];
    const totalReturn = currentValue - totalDeposited;
    const returnPercent = (totalReturn / totalDeposited) * 100;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">All-Time Returns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Amount Deposited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(totalDeposited)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total invested over time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(currentValue)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Portfolio value today</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totalReturn)}
              </div>
              <p className={`text-xs mt-1 ${returnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(returnPercent)} vs. deposits
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Trade History Component
  const TradeHistory = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Trade History</h2>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr className="text-left">
                    <th className="p-4 text-slate-400 font-medium">Asset</th>
                    <th className="p-4 text-slate-400 font-medium">Type</th>
                    <th className="p-4 text-slate-400 font-medium">Quantity</th>
                    <th className="p-4 text-slate-400 font-medium">Price</th>
                    <th className="p-4 text-slate-400 font-medium">Date/Time</th>
                    <th className="p-4 text-slate-400 font-medium">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trade, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="p-4">
                        <Badge className="bg-emerald-600 text-white">{trade.asset}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                          {trade.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-white">{trade.quantity}</td>
                      <td className="p-4 text-white">{formatCurrency(trade.price)}</td>
                      <td className="p-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{trade.date} {trade.time}</span>
                        </div>
                      </td>
                      <td className={`p-4 font-medium ${trade.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center gap-1">
                          {trade.gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(Math.abs(trade.gainLoss))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      <div className="pt-16">
        <MarketTicker />
      </div>
      
      <div className="pt-16 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Demo Mode Banner */}
          <div className="bg-amber-600/20 border border-amber-600/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-300 font-medium">Demo Mode</span>
            </div>
            <p className="text-amber-200 text-sm mt-1">
              This portfolio uses dummy data for demonstration. Connect your brokerage account to see real positions.
            </p>
          </div>

          <AccountSummary />
          <AssetBreakdownAndPerformance />
          <AllTimeReturns />
          <TradeHistory />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Portfolio;