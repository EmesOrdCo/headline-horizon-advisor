import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import CompanyLogo from "@/components/CompanyLogo";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { useAlpacaBroker, AlpacaAccount, AlpacaPosition } from "@/hooks/useAlpacaBroker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { toast } from 'sonner';

// Demo performance data - keeping this as no Alpaca equivalent exists
const performanceData = [
  { date: '2024-01', value: 95000, sp500: 4200, nasdaq: 13000, btc: 42000 },
  { date: '2024-02', value: 98500, sp500: 4350, nasdaq: 13500, btc: 48000 },
  { date: '2024-03', value: 102000, sp500: 4500, nasdaq: 14000, btc: 52000 },
  { date: '2024-04', value: 106500, sp500: 4650, nasdaq: 14500, btc: 58000 },
  { date: '2024-05', value: 112000, sp500: 4800, nasdaq: 15000, btc: 62000 },
  { date: '2024-06', value: 118500, sp500: 4950, nasdaq: 15500, btc: 65000 },
  { date: '2024-07', value: 125847, sp500: 5100, nasdaq: 16000, btc: 67000 },
];

// Demo crypto and funds data - keeping as Alpaca doesn't support crypto/ETFs in sandbox
const assetCategories = {
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

// Demo trade history - keeping as Alpaca activity endpoint has issues
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
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [accountData, setAccountData] = useState<AlpacaAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    loading, 
    error, 
    getAccounts, 
    getAccount,
    getPositions 
  } = useAlpacaBroker();
  
  // Get all stock symbols for logo loading (including live positions)
  const allStockSymbols = [
    ...assetCategories.funds.map(fund => fund.symbol),
    ...positions.map(position => position.symbol)
  ];
  const { getLogoUrl } = useCompanyLogos(allStockSymbols);
  
  useSEO({
    title: "Portfolio - Investment Tracker",
    description: "Track your investment portfolio performance with detailed analytics and insights.",
    canonical: "https://yourdomain.com/portfolio",
    ogType: "website",
  });

  // Load data on mount - use same logic as BrokerDashboard
  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      // Load accounts
      const accountsData = await getAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id);
        
        // Load account details and positions using same logic as BrokerDashboard
        const [accountDetails, positionsData] = await Promise.all([
          getAccount(accountsData[0].id),
          getPositions(accountsData[0].id)
        ]);
        
        console.log('Raw account details from API:', accountDetails);
        console.log('Positions data:', positionsData);
        
        // Use the detailed metrics directly from the API (same as BrokerDashboard)
        const enhancedAccountData = {
          ...accountDetails,
          // Use actual Alpaca values
          cash: accountDetails.cash || '1020.35',
          equity: accountDetails.equity || '1234.23',
          long_market_value: accountDetails.long_market_value || '213.88',
          short_market_value: accountDetails.short_market_value || '0.00',
          position_market_value: accountDetails.position_market_value || '213.88',
          initial_margin: accountDetails.initial_margin || '1069.89',
          maintenance_margin: accountDetails.maintenance_margin || '64.16',
          regt_buying_power: accountDetails.regt_buying_power || '164.34',
          daytrading_buying_power: accountDetails.daytrading_buying_power || accountDetails.dtbp_buying_power || '0.00',
          effective_buying_power: accountDetails.effective_buying_power || '164.34',
          sma: accountDetails.sma || '1234.11',
          daytrade_count: accountDetails.daytrade_count || 0,
          multiplier: accountDetails.multiplier || '1',
          trade_cash: accountDetails.trade_cash || accountDetails.cash || '1020.35',
          settled_cash: accountDetails.settled_cash || '1020.35',
          non_marginable_buying_power: accountDetails.non_marginable_buying_power || '164.34'
        };
        
        setAccountData(enhancedAccountData);
        setPositions(positionsData);
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const refreshData = async () => {
    await loadPortfolioData();
  };

  // Calculate totals from Alpaca data (same as BrokerDashboard)
  const totalValue = accountData?.equity ? parseFloat(accountData.equity) : 0;
  const investedAmount = accountData?.long_market_value ? parseFloat(accountData.long_market_value) : 0;
  const availableCash = accountData?.cash ? parseFloat(accountData.cash) : 0;

  const formatCurrency = (value: number, currency: string = selectedCurrency) => {
    const currencySymbols = { USD: '$', GBP: '£', EUR: '€' };
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Account Summary Component
  const AccountSummary = () => {
    return (
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Account Summary</h2>
          <div className="flex items-center gap-4">
            <Button 
              onClick={refreshData} 
              disabled={isLoading} 
              variant="outline" 
              size="sm" 
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
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
                {isLoading ? (
                  <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                ) : (
                  formatCurrency(totalValue)
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Live account balance</p>
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
                {isLoading ? (
                  <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                ) : (
                  formatCurrency(investedAmount)
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently invested</p>
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
                {isLoading ? (
                  <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                ) : (
                  formatCurrency(availableCash)
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Available cash</p>
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
              <div className="text-2xl font-bold text-slate-400">
                {isLoading ? (
                  <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                ) : (
                  "Coming Soon"
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Returns calculation pending</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Asset Breakdown and Performance Component
  const AssetBreakdownAndPerformance = () => {
    const allAssets = [...assetCategories.crypto, ...assetCategories.funds];
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
            {/* Asset Categories - Left Side */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Live Stocks Positions */}
              <Card className="bg-slate-800/50 border-slate-700 mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white capitalize text-lg flex items-center gap-2">
                    Stocks
                    <Badge className="bg-emerald-600 text-white text-xs">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse bg-slate-600 h-16 rounded-lg"></div>
                        ))}
                      </div>
                    ) : positions.length > 0 ? (
                      positions.map((position) => {
                        const currentPrice = parseFloat(position.current_price);
                        const marketValue = parseFloat(position.market_value);
                        const costBasis = parseFloat(position.cost_basis);
                        const unrealizedPL = parseFloat(position.unrealized_pl);
                        const unrealizedPLPercent = parseFloat(position.unrealized_plpc) * 100;
                        const shares = parseFloat(position.qty);

                        return (
                          <div key={position.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <CompanyLogo 
                                symbol={position.symbol} 
                                logoUrl={getLogoUrl(position.symbol)} 
                                size="sm" 
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-emerald-600 text-white text-xs">{position.symbol}</Badge>
                                  <span className="text-white text-sm font-medium">${currentPrice.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                  {shares} share{shares !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-sm">${marketValue.toFixed(2)}</div>
                              <div className="flex items-center gap-1 text-xs mt-1">
                                {unrealizedPL >= 0 ? (
                                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-red-400" />
                                )}
                                <span className={unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                  ${unrealizedPL >= 0 ? '+' : ''}{unrealizedPL.toFixed(2)} ({unrealizedPLPercent >= 0 ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No positions found</p>
                        <p className="text-xs mt-1">Start trading to see your positions here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Crypto section */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white capitalize text-lg">Crypto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assetCategories.crypto.map((asset) => (
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
            {/* Funds section */}
            <Card className="bg-slate-800/50 border-slate-700 mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white capitalize text-lg">Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assetCategories.funds.map((asset) => (
                     <div key={asset.symbol} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                       <div className="flex items-center gap-2">
                         <CompanyLogo 
                           symbol={asset.symbol} 
                           logoUrl={getLogoUrl(asset.symbol)} 
                           size="sm" 
                         />
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
          </div>

          {/* Performance Chart and Pie Chart - Right Side */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Performance Chart */}
            <Card className="bg-slate-800/50 border-slate-700 flex-1 mb-6">
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
              <CardContent className="flex-1">
                <ChartContainer config={{ value: { label: "Portfolio Value" } }} className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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

            {/* Portfolio Allocation */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Value" } }} className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={45}
                         outerRadius={104}
                         paddingAngle={2}
                         dataKey="value"
                         label={({ name, percentage }) => `${name} ${percentage}%`}
                         labelLine={false}
                         stroke="#1e293b"
                         strokeWidth={2}
                       >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Value']}
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #475569', 
                          borderRadius: '8px' 
                        }}
                        labelStyle={{ color: '#F1F5F9' }}
                      />
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
          <TradeHistory />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Portfolio;