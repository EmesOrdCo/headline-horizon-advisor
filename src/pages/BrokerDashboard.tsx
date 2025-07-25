import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlpacaBroker, AlpacaAccount, AlpacaAsset, AlpacaOrder, AlpacaPosition } from '@/hooks/useAlpacaBroker';
import SandboxBanner from '@/components/SandboxBanner';
import AccountCreation from '@/components/broker/AccountCreation';
import FundingSimulation from '@/components/broker/FundingSimulation';
import AssetExplorer from '@/components/broker/AssetExplorer';
import TradingInterface from '@/components/broker/TradingInterface';
import ActivitiesHistory from '@/components/broker/ActivitiesHistory';
import DeveloperTools from '@/components/broker/DeveloperTools';
import { toast } from 'sonner';

const BrokerDashboard = () => {
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [assets, setAssets] = useState<AlpacaAsset[]>([]);
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  
  const { 
    loading, 
    error, 
    getAccounts, 
    getAssets, 
    getOrders, 
    getPositions 
  } = useAlpacaBroker();

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
    } catch (err) {
      console.error('Failed to load initial data:', err);
      toast.error('Failed to load broker data');
    }
  };

  const loadAccountData = async (accountId: string) => {
    if (!accountId) return;
    
    try {
      const [ordersData, positionsData] = await Promise.all([
        getOrders(accountId, { limit: 50 }),
        getPositions(accountId)
      ]);
      
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <SandboxBanner />
      
      {/* Header with User-Centered Welcome */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Start Your Trading Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Follow these simple steps to create your account, add funds, and start trading
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${accounts.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accounts.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <span className="font-medium">Create Account</span>
          </div>
          <div className="w-8 h-px bg-border"></div>
          <div className={`flex items-center space-x-2 ${userStep !== 'create' && userStep !== 'fund' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userStep !== 'create' && userStep !== 'fund' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <span className="font-medium">Fund Account</span>
          </div>
          <div className="w-8 h-px bg-border"></div>
          <div className={`flex items-center space-x-2 ${userStep === 'trade' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userStep === 'trade' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
            <span className="font-medium">Start Trading</span>
          </div>
        </div>
      </div>

      {/* Step 1: Create Account */}
      {userStep === 'create' && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Step 1: Create Your Trading Account</CardTitle>
              <CardDescription>Set up your brokerage account with dummy KYC data for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountCreation onAccountCreated={refreshData} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Fund Account */}
      {userStep === 'fund' && accounts.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Account Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {accounts.map((account) => (
                  <Card 
                    key={account.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedAccount === account.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{account.account_number}</CardTitle>
                        <Badge variant={account.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Currency: {account.currency}
                      </p>
                      {account.last_equity && (
                        <p className="text-sm font-semibold">
                          Balance: ${parseFloat(account.last_equity).toFixed(2)}
                        </p>
                      )}
                      {account.buying_power && (
                        <p className="text-sm text-muted-foreground">
                          Buying Power: ${parseFloat(account.buying_power).toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Step 2: Fund Your Account</CardTitle>
              <CardDescription>Add money to your account to start trading</CardDescription>
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
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Trading Account</CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription>Account: {selectedAccountData?.account_number}</CardDescription>
                <Button onClick={refreshData} disabled={loading} variant="outline" size="sm">
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Account Balance</p>
                  <p className="text-2xl font-bold">
                    ${selectedAccountData?.last_equity ? parseFloat(selectedAccountData.last_equity).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Buying Power</p>
                  <p className="text-2xl font-bold">
                    ${selectedAccountData?.buying_power ? parseFloat(selectedAccountData.buying_power).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="text-2xl font-bold">{positions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradingInterface 
              accountId={selectedAccount}
              assets={assets}
              onOrderPlaced={refreshData}
            />

            {/* Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
                <CardDescription>Current stock holdings</CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No positions yet</p>
                    <p className="text-sm text-muted-foreground">Place your first trade to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {positions.map((position, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{position.symbol}</h3>
                            <p className="text-sm text-muted-foreground">
                              {position.qty} shares
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(position.market_value).toFixed(2)}</p>
                            <p className={`text-sm ${
                              parseFloat(position.unrealized_pl) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {parseFloat(position.unrealized_pl) >= 0 ? '+' : ''}
                              ${parseFloat(position.unrealized_pl).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Tools */}
          <Tabs defaultValue="activities" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activities">Trade History</TabsTrigger>
              <TabsTrigger value="assets">Browse Stocks</TabsTrigger>
              <TabsTrigger value="developer">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="activities">
              <ActivitiesHistory accountId={selectedAccount} />
            </TabsContent>

            <TabsContent value="assets">
              <AssetExplorer assets={assets} />
            </TabsContent>

            <TabsContent value="developer">
              <DeveloperTools />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BrokerDashboard;