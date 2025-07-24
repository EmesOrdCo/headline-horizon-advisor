import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const PrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({
    publicAccount: true,
    shareFullName: false,
    hideSensitiveInfo: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Privacy</h1>
          </div>

          <div className="space-y-8">
            
            {/* Trading Activity Section */}
            <Card>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">Trading Activity</CardTitle>
                <div className="flex justify-center mt-6">
                  <div className="relative">
                    <div className="w-24 h-16 border-2 border-muted rounded bg-background flex items-center justify-center">
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-2 bg-muted rounded-sm ${i === 4 ? 'h-6' : i === 3 ? 'h-4' : i === 2 ? 'h-3' : 'h-2'}`}></div>
                          ))}
                        </div>
                        <div className="flex gap-0.5 justify-center">
                          <div className="w-1 h-1 bg-muted rounded-full"></div>
                          <div className="w-1 h-1 bg-muted rounded-full"></div>
                          <div className="w-1 h-1 bg-muted rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <Eye className="absolute -top-2 -right-2 w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-center">
                  <p className="text-muted-foreground">
                    Turn your account private to hide your trading activity and holdings.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Note, private accounts cannot be copied, but any existing copiers will continue to copy your trades.
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Public Account</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={privacySettings.publicAccount}
                      onCheckedChange={(checked) => updateSetting('publicAccount', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {privacySettings.publicAccount ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Name Section */}
            <Card>
              <CardHeader>
                <CardTitle>Full Name</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Do you want to share your full name? (Recommended)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={privacySettings.shareFullName}
                      onCheckedChange={(checked) => updateSetting('shareFullName', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {privacySettings.shareFullName ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hide Sensitive Financial Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hide Sensitive Financial Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Conceals your balance, portfolio value, and other monetary info for privacy and security reasons.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={privacySettings.hideSensitiveInfo}
                      onCheckedChange={(checked) => updateSetting('hideSensitiveInfo', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {privacySettings.hideSensitiveInfo ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;