
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Edit, TrendingUp } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface UserProfile {
  email: string;
  gender: string;
  tradingExperience: string;
  stocks: string[];
  tradingStyle: string[];
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stockInput, setStockInput] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const addStock = () => {
    if (stockInput.trim() && profile && !profile.stocks.includes(stockInput.trim().toUpperCase())) {
      const updatedProfile = {
        ...profile,
        stocks: [...profile.stocks, stockInput.trim().toUpperCase()]
      };
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setStockInput("");
    }
  };

  const removeStock = (stock: string) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        stocks: profile.stocks.filter(s => s !== stock)
      };
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
  };

  if (!profile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-900">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 p-6">
              <div className="max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <p className="text-slate-400">No profile data found. Please complete the signup process.</p>
                </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-900">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Done Editing' : 'Edit Profile'}
                </Button>
              </div>

              <div className="grid gap-6">
                {/* Trading Info */}
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Trading Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Experience Level</p>
                      <p className="text-white font-medium">{profile.tradingExperience}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Trading Style</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.tradingStyle.map((style) => (
                          <Badge key={style} variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* My Stocks */}
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">My Stocks</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>{profile.stocks.length} positions</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={stockInput}
                        onChange={(e) => setStockInput(e.target.value.toUpperCase())}
                        placeholder="Enter stock symbol (e.g., AAPL)"
                        onKeyPress={(e) => e.key === 'Enter' && addStock()}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button onClick={addStock} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {profile.stocks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.stocks.map((stock) => (
                        <Badge 
                          key={stock} 
                          variant="secondary" 
                          className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-2 text-sm py-1 px-3"
                        >
                          {stock}
                          {isEditing && (
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-400" 
                              onClick={() => removeStock(stock)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No stocks added yet. Add some to get personalized predictions!</p>
                  )}
                </Card>

                {/* Account Info */}
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="text-white">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Member Since</p>
                      <p className="text-white">June 2025</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
