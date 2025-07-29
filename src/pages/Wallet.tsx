import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Wallet as WalletIcon, Users, DollarSign, RefreshCw } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useAccountData } from "@/hooks/useAccountData";
import ACHTransferModal from "@/components/ACHTransferModal";
import SimulateDepositModal from "@/components/SimulateDepositModal";
import TransferHistory from "@/components/TransferHistory";
import BankAccountStatus from "@/components/BankAccountStatus";
import BankAccountManager from "@/components/BankAccountManager";
import FundingSimulation from "@/components/broker/FundingSimulation";

const Wallet = () => {
  useSEO({
    title: "Wallet Dashboard | MarketSensorAI",
    description: "Manage your investment accounts, add funds, and track your portfolio balance with MarketSensorAI wallet dashboard.",
    canonical: "/wallet"
  });

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showACHTransfer, setShowACHTransfer] = useState(false);
  const [showSimulateDeposit, setShowSimulateDeposit] = useState(false);
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

  const friendAvatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <WalletIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Total Value Card */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-700 dark:text-slate-300">
                    Your Total Value
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={refreshData} 
                      disabled={isLoading} 
                      variant="outline" 
                      size="sm"
                      className="border-emerald-200 dark:border-emerald-500/30"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger className="w-20 border-emerald-200 dark:border-emerald-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 dark:bg-slate-600 h-12 w-48 rounded"></div>
                    ) : (
                      formatCurrency(totalValue)
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Last update at {currentTime}
                  </p>
                </div>
                {/* Progress bar placeholder */}
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full mt-4" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => setShowACHTransfer(true)}
                    disabled={!selectedAccount}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds via ACH
                  </Button>
                  <Button 
                    onClick={() => setShowSimulateDeposit(true)}
                    disabled={!selectedAccount}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Simulate Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* GBP Account */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">GBP Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 dark:bg-slate-600 h-9 w-32 rounded"></div>
                    ) : (
                      formatCurrency(availableCash, 'GBP')
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                    Available cash ready for trading and investments.
                  </p>
                </CardContent>
              </Card>

              {/* Investment Account */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                      <WalletIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Investment Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 dark:bg-slate-600 h-9 w-32 rounded"></div>
                    ) : (
                      formatCurrency(totalValue, 'GBP')
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-slate-400">Available USD</div>
                    <div className="text-xl font-semibold text-gray-700 dark:text-slate-300">
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-300 dark:bg-slate-600 h-6 w-24 rounded"></div>
                      ) : (
                        formatCurrency(availableCash, 'USD')
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transfer History */}
            {selectedAccount && (
              <TransferHistory accountId={selectedAccount.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Invite Friends Card */}
            <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Invite friends and trade together
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Refer a friend and share the power of social investing on MarketSensor.
                </p>
                <div className="flex -space-x-2 mb-4">
                  {friendAvatars.map((avatar, index) => (
                    <Avatar key={index} className="border-2 border-white dark:border-slate-800 w-10 h-10">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>U{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* ACH Transfer Modal */}
      {selectedAccount && (
        <ACHTransferModal
          isOpen={showACHTransfer}
          onClose={() => setShowACHTransfer(false)}
          accountId={selectedAccount.id}
          accountNumber={selectedAccount.account_number}
          onTransferComplete={() => {
            refreshData();
            setShowACHTransfer(false);
          }}
        />
      )}

      {/* Simulate Deposit Modal */}
      {selectedAccount && (
        <SimulateDepositModal
          isOpen={showSimulateDeposit}
          onClose={() => setShowSimulateDeposit(false)}
          accountId={selectedAccount.id}
          accountNumber={selectedAccount.account_number}
          onDepositComplete={() => {
            refreshData();
            setShowSimulateDeposit(false);
          }}
        />
      )}
    </div>
  );
};

export default Wallet;