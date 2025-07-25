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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SandboxBanner />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alpaca Broker Dashboard</h1>
        <Button onClick={refreshData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Account Selection */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
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
                        Equity: ${parseFloat(account.last_equity).toFixed(2)}
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
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="developer">Dev Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountCreation onAccountCreated={refreshData} />
        </TabsContent>

        <TabsContent value="funding">
          <FundingSimulation 
            accountId={selectedAccount} 
            accountData={selectedAccountData}
            onFundingComplete={refreshData}
          />
        </TabsContent>

        <TabsContent value="assets">
          <AssetExplorer assets={assets} />
        </TabsContent>

        <TabsContent value="trading">
          <TradingInterface 
            accountId={selectedAccount}
            assets={assets}
            onOrderPlaced={refreshData}
          />
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
              <CardDescription>
                {selectedAccount ? `Account: ${selectedAccountData?.account_number}` : 'Select an account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <p className="text-muted-foreground">No positions found</p>
              ) : (
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{position.symbol}</h3>
                          <p className="text-sm text-muted-foreground">
                            {position.qty} shares • {position.side}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${parseFloat(position.market_value).toFixed(2)}</p>
                          <p className={`text-sm ${
                            parseFloat(position.unrealized_pl) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {parseFloat(position.unrealized_pl) >= 0 ? '+' : ''}
                            ${parseFloat(position.unrealized_pl).toFixed(2)} 
                            ({parseFloat(position.unrealized_plpc).toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesHistory accountId={selectedAccount} />
        </TabsContent>

        <TabsContent value="developer">
          <DeveloperTools />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrokerDashboard;