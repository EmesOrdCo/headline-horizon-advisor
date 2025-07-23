import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Wallet as WalletIcon, Users, Smartphone, Bitcoin, DollarSign } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useSEO } from "@/hooks/useSEO";

const Wallet = () => {
  useSEO({
    title: "Wallet Dashboard | MarketSensorAI",
    description: "Manage your investment accounts, add funds, and track your portfolio balance with MarketSensorAI wallet dashboard.",
    canonical: "/wallet"
  });

  const [selectedCurrency, setSelectedCurrency] = useState("GBP");
  const currentTime = new Date().toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const friendAvatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <WalletIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Total Value Card */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-700 dark:text-slate-300">
                    Your Total Value
                  </CardTitle>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="w-20 border-emerald-200 dark:border-emerald-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {selectedCurrency === "GBP" ? "£" : "$"}0.00
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
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds to GBP
                  </Button>
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds to USD
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GBP Account */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">GBP Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">£0.00</div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    To manage your card, send payments and more please go to{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">MarketSensor Money app</span>.
                  </p>
                </CardContent>
              </Card>

              {/* Investment Account */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                      <WalletIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Investment Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">£0.00</div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-slate-400">Available USD</div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-slate-300">$0.00</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crypto Storage Banner */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">Store your crypto</h3>
                    <p className="text-emerald-100 max-w-md">
                      Securely store, send and receive the world's most popular crypto in the MarketSensor Money app.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="bg-white text-emerald-600 hover:bg-emerald-50"
                    >
                      Get the app
                    </Button>
                  </div>
                  <div className="hidden md:flex items-center gap-4 opacity-20">
                    <Bitcoin className="h-12 w-12" />
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-lg font-bold">Ξ</span>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-lg font-bold">◆</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

            {/* Portfolio Mobile Card */}
            <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Your portfolio on the go
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Manage your investments with ease using the MarketSensor app. Scan the code.
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-1 w-24 h-24">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-sm ${
                            Math.random() > 0.5
                              ? "bg-gray-800 dark:bg-white"
                              : "bg-gray-100 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <Smartphone className="h-4 w-4" />
                  <span>MarketSensor Money Balance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;