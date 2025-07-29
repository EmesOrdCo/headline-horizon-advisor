import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNav from "@/components/DashboardNav";

import Footer from "@/components/Footer";
import CompanyLogo from "@/components/CompanyLogo";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { useAlpacaBroker, AlpacaAccount, AlpacaPosition } from "@/hooks/useAlpacaBroker";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { toast } from 'sonner';
import { PendingOrdersModal } from "@/components/PendingOrdersModal";
import { usePendingOrders } from "@/hooks/usePendingOrders";

// Real performance data will be loaded from Alpaca portfolio history
const defaultPerformanceData = [
  { date: new Date().toISOString().slice(0, 7), value: 0, sp500: 4200, nasdaq: 13000, btc: 42000 }
];

// Note: Alpaca sandbox doesn't support crypto/ETFs, showing empty for real data
const assetCategories = {
  crypto: [],
  funds: []
};

// Trade history is now loaded from real Alpaca activities data

const Portfolio = () => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [benchmarkType, setBenchmarkType] = useState<'sp500' | 'nasdaq' | 'btc'>('sp500');
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [accountData, setAccountData] = useState<AlpacaAccount | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>(defaultPerformanceData);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook for pending orders data
  const { buyOrders, sellOrders, totalValue: pendingValue, isLoading: pendingLoading } = usePendingOrders();
  
  const { 
    loading, 
    error, 
    getAccounts, 
    getAccount,
    getPositions,
    getActivities,
    getOrders,
    getPortfolioHistory
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

  // Store today's portfolio snapshot
  const storePortfolioSnapshot = async (accountId: string, accountData: any) => {
    try {
      const snapshotData = {
        user_id: user!.id,
        account_id: accountId,
        snapshot_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        total_equity: parseFloat(accountData.equity || '0'),
        cash: parseFloat(accountData.cash || '0'),
        long_market_value: parseFloat(accountData.long_market_value || '0'),
        buying_power: parseFloat(accountData.buying_power || '0')
      };

      const { error } = await supabase
        .from('portfolio_snapshots')
        .upsert(snapshotData, { 
          onConflict: 'user_id,account_id,snapshot_date',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Failed to store portfolio snapshot:', error);
      } else {
        console.log('✅ Portfolio snapshot stored successfully');
      }
    } catch (err) {
      console.error('Error storing portfolio snapshot:', err);
    }
  };

  // Load historical portfolio data from stored snapshots
  const loadPortfolioHistory = async (accountId: string) => {
    try {
      const { data: snapshots, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', user!.id)
        .order('snapshot_date', { ascending: true })
        .limit(30); // Last 30 days

      if (error) {
        console.error('Failed to load portfolio snapshots:', error);
        return [];
      }

      if (snapshots && snapshots.length > 0) {
        return snapshots.map((snapshot, index) => ({
          date: snapshot.snapshot_date,
          value: parseFloat(snapshot.total_equity.toString()),
          sp500: 4200 + (index * 50), // Demo benchmark data
          nasdaq: 13000 + (index * 100), // Demo benchmark data
          btc: 42000 + (index * 1000) // Demo benchmark data
        }));
      }

      return [];
    } catch (err) {
      console.error('Error loading portfolio history:', err);
      return [];
    }
  };

  // Load data on mount - use user's account number from profile
  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Starting portfolio data load...');
      
      // Get user's account number from profile
      let userAccountNumber = null;
      if (user) {
        console.log('✅ Current user ID:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('alpaca_account_number, alpaca_account_id, alpaca_account_status')
          .eq('id', user.id)
          .maybeSingle();
        
        console.log('📊 Profile query result:', { profile, error: profileError });
        userAccountNumber = profile?.alpaca_account_number;
        console.log('🏦 User account number from profile:', userAccountNumber);
        
        if (!userAccountNumber) {
          console.error('❌ No account number found in profile! User needs to complete onboarding.');
          toast.error('No Alpaca account found. Please complete account setup first. Go to Alpaca Onboarding to create an account.');
          setIsLoading(false);
          return;
        }
      } else {
        console.error('❌ No user found');
        toast.error('Please sign in to view your portfolio.');
        setIsLoading(false);
        return;
      }
      
      // Load accounts
      const accountsData = await getAccounts();
      console.log('All accounts from Alpaca:', accountsData.map(acc => ({ id: acc.id, number: acc.account_number, status: acc.status })));
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        // Use user's account number if available, otherwise fallback to first account
        const targetAccount = userAccountNumber 
          ? accountsData.find(acc => acc.account_number === userAccountNumber)
          : accountsData[0];
        
        console.log('Target account found:', targetAccount);
        const selectedAccountId = targetAccount?.id || accountsData[0].id;
        console.log('Selected account ID:', selectedAccountId);
        setSelectedAccount(selectedAccountId);
        
        // Load account details, positions, orders, and activities
        const [accountDetails, positionsData, ordersData, activitiesData] = await Promise.all([
          getAccount(selectedAccountId),
          getPositions(selectedAccountId),
          getOrders(selectedAccountId, { status: 'all', limit: 50 }),
          getActivities(selectedAccountId).catch(() => []) // Handle 404 error gracefully
        ]);
        
        console.log('Raw account details from API:', accountDetails);
        console.log('Positions data:', positionsData);
        console.log('Orders data:', ordersData);
        
        // Use ONLY the real data from Alpaca API with better error handling
        console.log('Enhanced account details from API:', accountDetails);
        
        const enhancedAccountData = {
          ...accountDetails
        };
        
        console.log('Final account data being set:', enhancedAccountData);
        console.log('Parsed values:', {
          totalValue: accountDetails?.equity ? parseFloat(accountDetails.equity) : 0,
          availableCash: accountDetails?.cash ? parseFloat(accountDetails.cash) : 0,
          investedAmount: accountDetails?.long_market_value ? parseFloat(accountDetails.long_market_value) : 0,
        });
        
        setAccountData(enhancedAccountData);
        setPositions(positionsData);
        setOrders(ordersData || []);
        
        // Store today's portfolio snapshot
        await storePortfolioSnapshot(selectedAccountId, accountDetails);
        
        // Load historical portfolio data from our stored snapshots
        const historicalData = await loadPortfolioHistory(selectedAccountId);
        
        if (historicalData.length > 0) {
          setPerformanceData(historicalData);
          console.log(`📈 Loaded ${historicalData.length} historical data points from stored snapshots`);
        } else {
          // Fallback to current account value if no historical data
          const fallbackData = [{
            date: new Date().toISOString().slice(0, 10),
            value: parseFloat(accountDetails.equity || '0'),
            sp500: 4200,
            nasdaq: 13000,
            btc: 42000
          }];
          setPerformanceData(fallbackData);
          console.log('📊 Using fallback data - only today\'s value available');
        }
        
        // Only use order data for trade history (exclude transfers and other activities)
        const filledOrders = (ordersData || [])
          .filter((order: any) => order.status === 'filled')
          .map((order: any) => ({
            activity_type: 'FILL',
            symbol: order.symbol,
            description: `${order.side.toUpperCase()} ${order.filled_qty || order.qty} shares`,
            qty: order.filled_qty || order.qty,
            price: order.filled_avg_price || order.limit_price,
            created_at: order.updated_at || order.created_at,
            status: 'filled',
            side: order.side,
            order_id: order.id
          }));

        const pendingOrders = (ordersData || [])
          .filter((order: any) => ['accepted', 'pending_new', 'pending_cancel', 'pending_replace'].includes(order.status))
          .map((order: any) => ({
            activity_type: 'PENDING_ORDER',
            symbol: order.symbol,
            description: `${order.side.toUpperCase()} ${order.qty} shares - ${order.order_type} order`,
            qty: order.qty,
            price: order.limit_price,
            created_at: order.created_at,
            status: order.status,
            side: order.side,
            order_id: order.id
          }));

        // Only include trade-related activities (not transfers)
        const tradeActivities = (activitiesData || [])
          .filter((activity: any) => 
            activity.activity_type === 'FILL' || 
            activity.activity_type === 'PARTIAL_FILL' ||
            activity.order_id  // Has an order ID, so it's trade-related
          );

        // Combine only trade activities and orders, sort by date
        const combinedActivities = [...tradeActivities, ...filledOrders, ...pendingOrders]
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
        
        setActivities(combinedActivities);
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
      <div className="space-y-8 p-6">
        {/* Currency Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Account Overview</h2>
          <div className="flex items-center gap-4">
            <Button 
              onClick={refreshData} 
              disabled={isLoading} 
              variant="outline" 
              size="sm" 
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
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
    // Use real live stock positions for allocation instead of dummy data
    const livePositions = positions.map(position => ({
      symbol: position.symbol,
      qty: parseFloat(position.qty || '0'),
      currentValue: parseFloat(position.market_value || '0'),
      costBasis: parseFloat(position.cost_basis || '0'),
      unrealizedPL: parseFloat(position.unrealized_pl || '0'),
      unrealizedPLPercent: parseFloat(position.unrealized_plpc || '0'),
      currentPrice: parseFloat(position.current_price || '0')
    }));

    // Create allocation data from real positions, with demo fallback
    let totalValue = livePositions.reduce((sum, asset) => sum + asset.currentValue, 0);
    let pieData = [];

    if (livePositions.length > 0 && totalValue > 0) {
      // Use real positions
      pieData = livePositions.map((asset, index) => ({
        name: asset.symbol,
        value: asset.currentValue,
        percentage: ((asset.currentValue / totalValue) * 100).toFixed(1),
        color: `hsl(${(index * 45) % 360}, 70%, 60%)`
      }));
    } else {
      // Show cash only when no positions
      pieData = [{
        name: 'Cash',
        value: availableCash,
        percentage: '100.0',
        color: 'hsl(180, 70%, 60%)'
      }];
      totalValue = availableCash;
    }

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
                                <p className="text-xs text-slate-400">{shares.toFixed(2)} shares</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">${marketValue.toFixed(2)}</p>
                              <div className="flex items-center gap-1">
                                {unrealizedPL >= 0 ? (
                                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                                )}
                                <span className={`text-xs ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  ${Math.abs(unrealizedPL).toFixed(2)} ({unrealizedPLPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No stock positions</p>
                        <p className="text-xs mt-1">Account #{accountData?.account_number || 'Unknown'} - Real Alpaca data</p>
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
                    {assetCategories.crypto.length > 0 ? (
                      assetCategories.crypto.map((asset) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No crypto positions</p>
                        <p className="text-xs mt-1">Crypto trading not available in sandbox</p>
                      </div>
                    )}
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
                    {assetCategories.funds.length > 0 ? (
                      assetCategories.funds.map((asset) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No fund positions</p>
                        <p className="text-xs mt-1">Fund trading not available in sandbox</p>
                      </div>
                    )}
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
                      <YAxis 
                        stroke="#9CA3AF" 
                        domain={['dataMin - 100', 'dataMax + 100']}
                        tickFormatter={(value) => {
                          if (value >= 1000) {
                            return `$${(value/1000).toFixed(1)}k`;
                          }
                          return `$${Math.round(value)}`;
                        }}
                      />
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



  // Trade History Component - Using real Alpaca activities data
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
                    <th className="p-4 text-slate-400 font-medium">ACCOUNT</th>
                    <th className="p-4 text-slate-400 font-medium">ORDER ID</th>
                    <th className="p-4 text-slate-400 font-medium">SIDE</th>
                    <th className="p-4 text-slate-400 font-medium">SYMBOL</th>
                    <th className="p-4 text-slate-400 font-medium">FILLED QTY</th>
                    <th className="p-4 text-slate-400 font-medium">PRICE</th>
                    <th className="p-4 text-slate-400 font-medium">STATUS</th>
                    <th className="p-4 text-slate-400 font-medium">SUBMITTED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center">
                        <div className="animate-pulse space-y-2">
                          <div className="bg-slate-600 h-4 w-3/4 mx-auto rounded"></div>
                          <div className="bg-slate-600 h-4 w-1/2 mx-auto rounded"></div>
                        </div>
                      </td>
                    </tr>
                   ) : activities.length > 0 ? (
                     activities.map((activity, index) => {
                       // Map Alpaca activity data to display format similar to the screenshot
                       const activityDate = new Date(activity.date || activity.created_at || activity.filled_at || '');
                       const formattedDate = activityDate.toLocaleDateString('en-US', { 
                         year: 'numeric', 
                         month: '2-digit', 
                         day: '2-digit' 
                       });
                       const formattedTime = activityDate.toLocaleTimeString([], { 
                         hour: '2-digit', 
                         minute: '2-digit',
                         hour12: true
                       });

                       // Get account number (truncated)
                       const accountNumber = selectedAccount ? 
                         accounts.find(acc => acc.id === selectedAccount)?.account_number || 'N/A' : 'N/A';

                       return (
                         <tr key={activity.order_id || index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                           <td className="p-4">
                             <span className="text-yellow-400 font-mono text-sm">
                               {accountNumber}
                             </span>
                           </td>
                           <td className="p-4">
                             <span className="text-yellow-400 font-mono text-sm">
                               {activity.order_id ? activity.order_id.substring(0, 8) + '...' : 'N/A'}
                             </span>
                           </td>
                           <td className="p-4">
                             <Badge 
                               variant={activity.side === 'buy' ? 'default' : 'destructive'}
                               className={activity.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                             >
                               {activity.side?.charAt(0).toUpperCase() + activity.side?.slice(1) || 'N/A'}
                             </Badge>
                           </td>
                           <td className="p-4">
                             <Badge className="bg-slate-600 text-white">
                               {activity.symbol || 'N/A'}
                             </Badge>
                           </td>
                           <td className="p-4 text-white font-mono">
                             {activity.qty || activity.quantity || '0'}
                           </td>
                           <td className="p-4 text-white font-mono">
                             {activity.price || activity.filled_avg_price ? 
                               `$${parseFloat(activity.price || activity.filled_avg_price).toFixed(2)}` : 
                               'N/A'
                             }
                           </td>
                           <td className="p-4">
                             <Badge 
                               variant={activity.status === 'filled' ? 'default' : 'outline'}
                               className={
                                 activity.status === 'filled' 
                                   ? 'bg-green-600 text-white' 
                                   : activity.status === 'accepted' 
                                     ? 'bg-blue-600 text-white'
                                     : 'text-slate-300 border-slate-600'
                               }
                             >
                               {activity.status === 'filled' ? '✓ Filled' : 
                                activity.status === 'accepted' ? 'Accepted' : 
                                activity.status || 'Completed'}
                             </Badge>
                           </td>
                           <td className="p-4 text-slate-300 font-mono text-sm">
                             <div>{formattedDate}</div>
                             <div className="text-xs text-slate-400">{formattedTime}</div>
                           </td>
                         </tr>
                       );
                     })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No trade history yet. Make your first trade to see activity here.
                        </td>
                      </tr>
                     )}
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
      
      <div className="pt-16 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-12">

          <AccountSummary />
          
          {/* Pending Orders Section - Always Visible */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Pending Orders
                </CardTitle>
                <PendingOrdersModal>
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10">
                    View All Orders
                  </Button>
                </PendingOrdersModal>
              </div>
              <CardDescription>
                Active limit orders and pending transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {pendingLoading ? "..." : buyOrders}
                    </div>
                    <div className="text-sm text-blue-300">Pending Buy Orders</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {pendingLoading ? "..." : sellOrders}
                    </div>
                    <div className="text-sm text-orange-300">Pending Sell Orders</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {pendingLoading ? "$..." : `$${pendingValue.toFixed(2)}`}
                    </div>
                    <div className="text-sm text-purple-300">Total Pending Value</div>
                  </div>
                </div>
                
                <PendingOrdersModal>
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Manage All Pending Orders
                  </Button>
                </PendingOrdersModal>
              </div>
            </CardContent>
          </Card>
          
          <AssetBreakdownAndPerformance />
          <TradeHistory />
          
          {/* Account Overview - Same as Trading Dashboard */}
          {accountData && (
            <Card className="bg-slate-800/50 border-slate-700">
               <CardHeader>
                 <div>
                   <CardTitle className="text-xl text-white">Account Overview</CardTitle>
                   <p className="text-slate-400">Account: {accountData.account_number}</p>
                 </div>
               </CardHeader>
              <CardContent>
                {/* Primary Account Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-emerald-500/10 border-emerald-500/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-emerald-300 mb-1">Equity</p>
                      <p className="text-3xl font-bold text-emerald-400">
                        ${accountData.equity ? parseFloat(accountData.equity).toFixed(2) : '0.00'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-blue-300 mb-1">Cash</p>
                      <p className="text-3xl font-bold text-blue-400">
                        ${accountData.cash ? parseFloat(accountData.cash).toFixed(2) : '0.00'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-purple-300 mb-1">RegT Buying Power</p>
                      <p className="text-3xl font-bold text-purple-400">
                        ${accountData.regt_buying_power ? parseFloat(accountData.regt_buying_power).toFixed(2) : '0.00'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-500/10 border-orange-500/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-orange-300 mb-1">Long Market Value</p>
                      <p className="text-3xl font-bold text-orange-400">
                        ${accountData.long_market_value ? parseFloat(accountData.long_market_value).toFixed(2) : '0.00'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Trading Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Trading Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Day Trading Buying Power</p>
                        <p className="text-lg font-semibold text-white">
                          ${accountData.daytrading_buying_power || accountData.dtbp_buying_power ? 
                            parseFloat(accountData.daytrading_buying_power || accountData.dtbp_buying_power).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Short Market Value</p>
                        <p className="text-lg font-semibold text-white">
                          ${accountData.short_market_value ? parseFloat(accountData.short_market_value).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Position Market Value</p>
                        <p className="text-lg font-semibold text-white">
                          ${(() => {
                            const longValue = accountData.long_market_value ? parseFloat(accountData.long_market_value) : 0;
                            const shortValue = accountData.short_market_value ? parseFloat(accountData.short_market_value) : 0;
                            return (longValue + shortValue).toFixed(2);
                          })()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Day Trade Count</p>
                        <p className="text-lg font-semibold text-white">
                          {accountData.daytrade_count || '0'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Margin & Risk Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Margin & Risk Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Initial Margin</p>
                        <p className="text-lg font-semibold text-white">
                          ${accountData.initial_margin ? parseFloat(accountData.initial_margin).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Maintenance Margin</p>
                        <p className="text-lg font-semibold text-white">
                          ${accountData.maintenance_margin ? parseFloat(accountData.maintenance_margin).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">Multiplier</p>
                        <p className="text-lg font-semibold text-white">
                          {accountData.multiplier || '1'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">SMA</p>
                        <p className="text-lg font-semibold text-white">
                          ${accountData.sma ? parseFloat(accountData.sma).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Portfolio;