import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, Activity, ExternalLink, AlertTriangle } from 'lucide-react';
import MarketTicker from '@/components/MarketTicker';
import { useAlpacaBroker, AlpacaAccount, AlpacaAsset, AlpacaOrder, AlpacaPosition } from '@/hooks/useAlpacaBroker';
import DashboardNav from '@/components/DashboardNav';
import SandboxBanner from '@/components/SandboxBanner';
import AccountCreation from '@/components/broker/AccountCreation';
import FundingSimulation from '@/components/broker/FundingSimulation';
import AssetExplorer from '@/components/broker/AssetExplorer';
import TradingInterface from '@/components/broker/TradingInterface';
import ActivitiesHistory from '@/components/broker/ActivitiesHistory';
import DeveloperTools from '@/components/broker/DeveloperTools';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const BrokerDashboard = () => {
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [assets, setAssets] = useState<AlpacaAsset[]>([]);
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    loading, 
    error, 
    getAccounts, 
    getAccount,
    getAssets, 
    getOrders, 
    getPositions 
  } = useAlpacaBroker();

  const { signOut } = useAuth();


  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load accounts
      const accountsData = await getAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id);
      }

      // Load assets
      const assetsData = await getAssets({ status: 'active', asset_class: 'us_equity' });
      setAssets(assetsData.slice(0, 100)); // Limit to first 100 for performance
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      toast.error('Failed to load broker data');
      setIsInitialized(true);
    }
  };

  const loadAccountData = async (accountId: string) => {
    if (!accountId) return;
    
    try {
      const [accountDetails, ordersData, positionsData] = await Promise.all([
        getAccount(accountId),
        getOrders(accountId, { limit: 50 }),
        getPositions(accountId)
      ]);
      
      // Update the selected account with detailed data
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, ...accountDetails } : acc
      ));
      
      setOrders(ordersData);
      setPositions(positionsData);
    } catch (err) {
      console.error('Failed to load account data:', err);
      toast.error('Failed to load account data');
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      loadAccountData(selectedAccount);
    }
  }, [selectedAccount]);

  const refreshData = () => {
    loadInitialData();
    if (selectedAccount) {
      loadAccountData(selectedAccount);
    }
  };

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  const userStep = accounts.length === 0 ? 'create' : 
                   !selectedAccount || !selectedAccountData?.last_equity || parseFloat(selectedAccountData.last_equity) === 0 ? 'fund' : 
                   'trade';

  // Show loading state until initialized to prevent flicker
  if (!isInitialized) {
    return (
      <>
        <DashboardNav />
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-lg">Loading broker data...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-slate-900">
        {/* Market Ticker */}
        <MarketTicker />

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Sandbox Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className="bg-amber-500 text-slate-900 font-medium">
                  SANDBOX TRADING
                </Badge>
                <span className="text-amber-100 font-medium">
                  Alpaca Broker API Simulation Environment
                </span>
              </div>
              <span className="text-xs text-amber-200">
                Practice trading with real market data
              </span>
            </div>
          </div>

          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Trading Dashboard
              </h1>
              <p className="text-xl text-slate-400">
                Practice trading with real market data in a safe sandbox environment
              </p>
            </div>
          </div>

          {error && (
            <Card className="bg-red-900/50 border-red-500/50">
              <CardContent className="pt-6">
                <p className="text-red-200 font-medium">Error: {error}</p>
              </CardContent>
            </Card>
          )}


          {/* Step 1: Create Account */}
          {userStep === 'create' && (
            <div className="animate-fade-in">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-400">1</span>
                  </div>
                  <CardTitle className="text-2xl text-white">Create Your Trading Account</CardTitle>
                  <CardDescription className="text-slate-400 text-base">Set up your brokerage account with demo data for testing</CardDescription>
                </CardHeader>
                <CardContent>
                  <AccountCreation onAccountCreated={refreshData} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Fund Account */}
          {userStep === 'fund' && accounts.length > 0 && (
            <div className="animate-fade-in space-y-6">
              {/* Account Selection */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <span>Your Trading Account</span>
                    <Badge className="bg-emerald-600 text-white">Active</Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">Manage your trading account settings and balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                      <Card 
                        key={account.id} 
                        className={`cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                          selectedAccount === account.id 
                            ? 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500' 
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedAccount(account.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base text-white">{account.account_number}</CardTitle>
                            <Badge variant={account.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-emerald-600 text-white">
                              {account.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-400">Balance</span>
                            <span className="text-sm font-semibold text-white">
                              ${account.last_equity ? parseFloat(account.last_equity).toFixed(2) : '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-400">Buying Power</span>
                            <span className="text-sm font-medium text-emerald-400">
                              ${account.buying_power ? parseFloat(account.buying_power).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-400">2</span>
                  </div>
                  <CardTitle className="text-2xl text-white">Fund Your Account</CardTitle>
                  <CardDescription className="text-slate-400 text-base">Add virtual funds to start trading</CardDescription>
                </CardHeader>
                <CardContent>
                  <FundingSimulation 
                    accountId={selectedAccount} 
                    accountData={selectedAccountData}
                    onFundingComplete={refreshData}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Trading Dashboard */}
          {userStep === 'trade' && (
            <div className="animate-fade-in space-y-6">
              {/* Account Overview */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-white">Account Overview</CardTitle>
                      <CardDescription className="text-slate-400">Account: {selectedAccountData?.account_number}</CardDescription>
                    </div>
                    <Button onClick={refreshData} disabled={loading} variant="outline" size="sm" className="hover-scale bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
                      {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Primary Account Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-emerald-500/10 border-emerald-500/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-emerald-300 mb-1">Equity</p>
                        <p className="text-3xl font-bold text-emerald-400">
                          ${selectedAccountData?.equity ? parseFloat(selectedAccountData.equity).toFixed(2) : 
                            selectedAccountData?.last_equity ? parseFloat(selectedAccountData.last_equity).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-blue-300 mb-1">Cash</p>
                        <p className="text-3xl font-bold text-blue-400">
                          ${selectedAccountData?.cash ? parseFloat(selectedAccountData.cash).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-500/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-purple-300 mb-1">RegT Buying Power</p>
                        <p className="text-3xl font-bold text-purple-400">
                          ${selectedAccountData?.regt_buying_power ? parseFloat(selectedAccountData.regt_buying_power).toFixed(2) : '0.00'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-orange-300 mb-1">Long Market Value</p>
                        <p className="text-3xl font-bold text-orange-400">
                          ${selectedAccountData?.long_market_value ? parseFloat(selectedAccountData.long_market_value).toFixed(2) : '0.00'}
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
                            ${selectedAccountData?.daytrading_buying_power || selectedAccountData?.dtbp_buying_power ? 
                              parseFloat(selectedAccountData.daytrading_buying_power || selectedAccountData.dtbp_buying_power!).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Short Market Value</p>
                          <p className="text-lg font-semibold text-white">
                            ${selectedAccountData?.short_market_value ? parseFloat(selectedAccountData.short_market_value).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Position Market Value</p>
                          <p className="text-lg font-semibold text-white">
                            ${(() => {
                              const longValue = selectedAccountData?.long_market_value ? parseFloat(selectedAccountData.long_market_value) : 0;
                              const shortValue = selectedAccountData?.short_market_value ? parseFloat(selectedAccountData.short_market_value) : 0;
                              return (longValue + shortValue).toFixed(2);
                            })()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Day Trade Count</p>
                          <p className="text-lg font-semibold text-white">
                            {selectedAccountData?.daytrade_count || '0'}
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
                            ${selectedAccountData?.initial_margin ? parseFloat(selectedAccountData.initial_margin).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Maintenance Margin</p>
                          <p className="text-lg font-semibold text-white">
                            ${selectedAccountData?.maintenance_margin ? parseFloat(selectedAccountData.maintenance_margin).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Multiplier</p>
                          <p className="text-lg font-semibold text-white">
                            {selectedAccountData?.multiplier || '1'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">SMA</p>
                          <p className="text-lg font-semibold text-white">
                            ${selectedAccountData?.sma ? parseFloat(selectedAccountData.sma).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Account ID</p>
                          <p className="text-sm font-semibold text-white break-all">
                            {selectedAccountData?.id || 'N/A'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Trade Cash</p>
                          <p className="text-lg font-semibold text-white">
                            ${selectedAccountData?.trade_cash || selectedAccountData?.cash ? 
                              parseFloat(selectedAccountData.trade_cash || selectedAccountData.cash!).toFixed(2) : '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Open Positions</p>
                          <p className="text-lg font-semibold text-white">{positions.length}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-slate-400 mb-1">Balance As Of</p>
                          <p className="text-sm font-semibold text-white">
                            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Trading Interface */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TradingInterface 
                  accountId={selectedAccount}
                  assets={assets}
                  onOrderPlaced={refreshData}
                />

                {/* Positions */}
                <Card className="h-fit bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <span>Your Positions</span>
                      {positions.length > 0 && (
                        <Badge className="bg-emerald-600 text-white">{positions.length}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">Current stock holdings and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {positions.length === 0 ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-slate-300">No positions yet</p>
                          <p className="text-sm text-slate-400">Place your first trade to get started!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {positions.map((position, index) => (
                          <Card key={index} className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-lg text-white">{position.symbol}</h3>
                                  <p className="text-sm text-slate-400">
                                    {position.qty} shares
                                  </p>
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="font-semibold text-lg text-white">${parseFloat(position.market_value).toFixed(2)}</p>
                                  <div className="flex items-center space-x-1">
                                    {parseFloat(position.unrealized_pl) >= 0 ? (
                                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className={`text-sm font-medium ${
                                      parseFloat(position.unrealized_pl) >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                      {parseFloat(position.unrealized_pl) >= 0 ? '+' : ''}
                                      ${parseFloat(position.unrealized_pl).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Tools */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Trading Tools & History</CardTitle>
                  <CardDescription className="text-slate-400">Access advanced features and view your trading activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="activities" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                      <TabsTrigger value="activities" className="flex items-center space-x-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                        <Activity className="w-4 h-4" />
                        <span>Trade History</span>
                      </TabsTrigger>
                      <TabsTrigger value="assets" className="flex items-center space-x-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                        <ExternalLink className="w-4 h-4" />
                        <span>Browse Stocks</span>
                      </TabsTrigger>
                      <TabsTrigger value="developer" className="flex items-center space-x-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Advanced</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="activities" className="space-y-4">
                      <ActivitiesHistory accountId={selectedAccount} />
                    </TabsContent>

                    <TabsContent value="assets" className="space-y-4">
                      <AssetExplorer assets={assets} />
                    </TabsContent>

                    <TabsContent value="developer" className="space-y-4">
                      <DeveloperTools />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default BrokerDashboard;