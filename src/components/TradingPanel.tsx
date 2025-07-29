import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TradingModal } from './TradingModal';

const TradingPanel = () => {
  const { user } = useAuth();
  const { loading } = useAlpacaBroker();
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('1');
  const [timeInForce, setTimeInForce] = useState('gtc');
  const [extendedHours, setExtendedHours] = useState(false);
  const [isAccountLinked, setIsAccountLinked] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy');

  // Check if Alpaca account is linked
  React.useEffect(() => {
    const checkAccountStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('alpaca_account_number, alpaca_account_status')
          .eq('id', user.id)
          .single();
        
        setIsAccountLinked(!!(profile?.alpaca_account_number && profile?.alpaca_account_status === 'ACTIVE'));
      }
    };
    
    checkAccountStatus();
  }, [user]);

  const handleBuyClick = () => {
    if (!isAccountLinked) {
      toast.error('Please link your Alpaca account first');
      return;
    }
    setModalType('buy');
    setShowTradingModal(true);
  };

  const handleSellClick = () => {
    if (!isAccountLinked) {
      toast.error('Please link your Alpaca account first');
      return;
    }
    setModalType('sell');
    setShowTradingModal(true);
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg">Trading Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Order Type */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="stop_limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                min="1"
              />
            </div>

            {/* Time in Force */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Time in Force</label>
              <Select value={timeInForce} onValueChange={setTimeInForce}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtc">GTC</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="ioc">IOC</SelectItem>
                  <SelectItem value="fok">FOK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Options</label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  checked={extendedHours}
                  onCheckedChange={setExtendedHours}
                />
                <span className="text-sm text-slate-300">Extended Hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {/* Account Status */}
            <div className="flex items-center space-x-2">
              {isAccountLinked ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">✓ Alpaca Account Linked</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400">Alpaca Account Not Linked</span>
                </>
              )}
            </div>

            {/* Trading Buttons */}
            <div className="flex space-x-2">
              <TradingModal 
                symbol="AAPL" 
                currentPrice={150} 
                initialMode="buy"
              >
                <Button
                  disabled={loading || !isAccountLinked}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  BUY
                </Button>
              </TradingModal>
              
              <TradingModal 
                symbol="AAPL" 
                currentPrice={150} 
                initialMode="sell"
              >
                <Button
                  disabled={loading || !isAccountLinked}
                  className="bg-red-600 hover:bg-red-700 text-white px-6"
                >
                  SELL
                </Button>
              </TradingModal>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TradingPanel;