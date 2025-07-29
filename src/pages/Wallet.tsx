import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  Plus, 
  DollarSign, 
  CreditCard,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Banknote
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useAccountData } from "@/hooks/useAccountData";
import BankAccountStatus from "@/components/BankAccountStatus";
import TransferHistory from "@/components/TransferHistory";
import FundingSimulation from "@/components/broker/FundingSimulation";

const Wallet = () => {
  useSEO({
    title: "Wallet Dashboard | MarketSensorAI",
    description: "Manage your investment accounts, add funds, and track your portfolio balance with MarketSensorAI wallet dashboard.",
    canonical: "/wallet"
  });

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const { totalValue, availableCash, isLoading, refreshData, selectedAccount } = useAccountData();
  
  const currentTime = new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const formatCurrency = (value: number, currency: string = selectedCurrency) => {
    const currencySymbols = { USD: '$', GBP: '£' };
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Wallet</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={refreshData} 
              disabled={isLoading} 
              variant="outline" 
              size="sm"
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-20 border-slate-600 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Portfolio Value */}
              <Card className="bg-slate-800/50 border-slate-700 col-span-1 md:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-300 text-lg">Total Portfolio Value</CardTitle>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-medium">+2.3%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-white">
                      {isLoading ? (
                        <div className="animate-pulse bg-slate-600 h-12 w-48 rounded"></div>
                      ) : (
                        formatCurrency(totalValue)
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Last updated at {currentTime}
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* Available Cash */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">Available Cash</CardTitle>
                      <p className="text-slate-400 text-sm">Ready for trading</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                    ) : (
                      formatCurrency(availableCash)
                    )}
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Account Management Tabs */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Account Management</CardTitle>
                <p className="text-slate-400">Manage your funding, transfers, and transaction history</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="funding" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="funding" className="data-[state=active]:bg-slate-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Funds
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="data-[state=active]:bg-slate-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Bank Accounts
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-slate-600">
                      <History className="w-4 h-4 mr-2" />
                      Transaction History
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="funding" className="mt-6">
                    {selectedAccount ? (
                      <FundingSimulation 
                        accountId={selectedAccount.id} 
                        accountData={selectedAccount}
                        onFundingComplete={refreshData} 
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No account selected</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="accounts" className="mt-6">
                    {selectedAccount ? (
                      <BankAccountStatus 
                        accountId={selectedAccount.id}
                        onAddNewBank={() => {}}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No account selected</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-6">
                    {selectedAccount ? (
                      <TransferHistory accountId={selectedAccount.id} />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No account selected</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Type</span>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                      Sandbox
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trading Status</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account ID</span>
                    <span className="text-white text-sm font-mono">
                      {selectedAccount?.account_number?.slice(-6) || '------'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!selectedAccount}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                  variant="outline"
                  disabled={!selectedAccount}
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
                <Button 
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                  variant="outline"
                  disabled={!selectedAccount}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  View Statements
                </Button>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Environment Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      <span className="font-semibold">Sandbox Mode:</span> All transactions are simulated and no real money is involved.
                    </p>
                  </div>
                  <p className="text-slate-400 text-sm">
                    You can safely test all funding and trading features without any financial risk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wallet;