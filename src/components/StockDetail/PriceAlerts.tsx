
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Info } from "lucide-react";

interface PriceAlertsProps {
  symbol: string;
  currentPrice: number;
}

const PriceAlerts = ({ symbol, currentPrice }: PriceAlertsProps) => {
  const [selectedAlertType, setSelectedAlertType] = useState<string>('');
  const [customAlertValue, setCustomAlertValue] = useState<string>('');

  const handleAlertSelection = (alertType: string) => {
    setSelectedAlertType(alertType);
    setCustomAlertValue('');
  };

  const handleSetAlert = () => {
    if (selectedAlertType === 'Custom' && customAlertValue) {
      console.log(`Setting custom alert for ${symbol} at $${customAlertValue}`);
    } else if (selectedAlertType && selectedAlertType !== 'Custom') {
      const percentage = parseFloat(selectedAlertType.replace('%', ''));
      const targetPrice = currentPrice * (1 + percentage / 100);
      console.log(`Setting ${selectedAlertType} alert for ${symbol} at $${targetPrice.toFixed(2)}`);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Set Price Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
          <Info className="w-4 h-4" />
          <span>Get notified when price hits target</span>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {['-10%', '-5%', '+5%', '+10%'].map((option) => (
            <Button
              key={option}
              variant={selectedAlertType === option ? "default" : "outline"}
              className={`px-4 py-2 text-sm rounded ${
                selectedAlertType === option 
                  ? "bg-emerald-600 text-white border-emerald-600" 
                  : "bg-transparent border-slate-600 text-slate-300 hover:border-emerald-600 hover:text-emerald-400"
              }`}
              onClick={() => handleAlertSelection(option)}
            >
              {option}
            </Button>
          ))}
          
          <Button
            variant={selectedAlertType === 'Custom' ? "default" : "outline"}
            className={`px-4 py-2 text-sm ${
              selectedAlertType === 'Custom'
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-transparent border-slate-600 text-slate-300 hover:border-emerald-600 hover:text-emerald-400"
            }`}
            onClick={() => handleAlertSelection('Custom')}
          >
            Custom Price
          </Button>
        </div>

        {selectedAlertType === 'Custom' && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="custom-alert" className="text-slate-300 text-sm">
              Target Price
            </Label>
            <Input
              id="custom-alert"
              type="number"
              placeholder="Enter price"
              value={customAlertValue}
              onChange={(e) => setCustomAlertValue(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        )}

        {selectedAlertType && (
          <Button 
            onClick={handleSetAlert}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Set Alert
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;
