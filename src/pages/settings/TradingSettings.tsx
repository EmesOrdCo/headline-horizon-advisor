import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const TradingSettings = () => {
  const [tradingSettings, setTradingSettings] = useState({
    ethStaking: false,
    stakingProgram: true,
    oneClickTrading: false,
    sharing: true
  });

  const updateSetting = (key: string, value: boolean) => {
    setTradingSettings(prev => ({
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
            <h1 className="text-2xl font-semibold">Trading</h1>
          </div>

          <div className="space-y-6">
            
            {/* ETH Staking Program */}
            <Card>
              <CardHeader>
                <CardTitle>ETH Staking Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-muted-foreground">
                      By choosing to stake your ETH with eToro, you will receive ETH staking rewards. If you opt out, eToro will 
                      not stake your assets. Disclosure: ETH staking with eToro is designed to be secure. However, there are a 
                      few risks you should understand before staking, click here to{" "}
                      <span className="text-primary hover:underline cursor-pointer">learn more</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tradingSettings.ethStaking}
                      onCheckedChange={(checked) => updateSetting('ethStaking', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tradingSettings.ethStaking ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staking Program (excluding ETH) */}
            <Card>
              <CardHeader>
                <CardTitle>Staking Program (excluding ETH)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-muted-foreground">
                      I agree to participate in eToro's staking services and receive staking rewards. It's important to be aware 
                      that staking is risky and you may experience losses and your assets may be restricted.{" "}
                      <span className="text-primary hover:underline cursor-pointer">Learn more</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tradingSettings.stakingProgram}
                      onCheckedChange={(checked) => updateSetting('stakingProgram', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tradingSettings.stakingProgram ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* One Click Trading */}
            <Card>
              <CardHeader>
                <CardTitle>One Click Trading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-medium mb-2">Do you want to enable one click trading?</p>
                    <p className="text-sm text-muted-foreground">
                      One Click Trading allows you to open and close your trades faster, with only one click. By activating this feature, 
                      you will be able to pre-define the parameters you'd like to use on your trades, such as the trade size.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tradingSettings.oneClickTrading}
                      onCheckedChange={(checked) => updateSetting('oneClickTrading', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tradingSettings.oneClickTrading ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-muted-foreground">
                      Display a popup to allow sharing your trades with others
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tradingSettings.sharing}
                      onCheckedChange={(checked) => updateSetting('sharing', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tradingSettings.sharing ? 'ON' : 'OFF'}
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

export default TradingSettings;