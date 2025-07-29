import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { useAccountData } from "@/hooks/useAccountData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CompanyLogo from "./CompanyLogo";
import { PendingOrdersModal } from "./PendingOrdersModal";

interface AlpacaTradingModalProps {
  children: React.ReactNode;
  symbol: string;
  currentPrice: number;
  initialMode?: "buy" | "sell";
}

export const AlpacaTradingModal = ({ 
  children, 
  symbol, 
  currentPrice, 
  initialMode = "buy" 
}: AlpacaTradingModalProps) => {
  const { user } = useAuth();
  const { placeOrder, loading, getPositions } = useAlpacaBroker();
  const { availableCash: realAvailableCash, isLoading: accountLoading, selectedAccount, positions } = useAccountData();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"buy" | "sell">(initialMode);
  const [quantity, setQuantity] = useState("1");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<"day" | "gtc">("gtc");
  const [isAccountLinked, setIsAccountLinked] = useState(false);
  const [userAccountId, setUserAccountId] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "confirmation" | "success" | "error">("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Check account status
  useEffect(() => {
    const checkAccountStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('alpaca_account_id, alpaca_account_number, alpaca_account_status')
          .eq('id', user.id)
          .single();
        
        if (profile?.alpaca_account_id && profile?.alpaca_account_status === 'ACTIVE') {
          setIsAccountLinked(true);
          setUserAccountId(profile.alpaca_account_id);
        } else {
          setIsAccountLinked(false);
        }
      }
    };
    
    if (open) {
      checkAccountStatus();
    }
  }, [user, open]);

  // Get current position for this symbol
  const currentPosition = positions?.find(pos => pos.symbol === symbol);
  const ownedShares = currentPosition ? parseFloat(currentPosition.qty) : 0;
  
  const totalCost = parseFloat(quantity) * currentPrice;
  const estimatedValue = orderType === "limit" && limitPrice ? parseFloat(quantity) * parseFloat(limitPrice) : totalCost;

  const handlePlaceOrder = async () => {
    if (!userAccountId) {
      toast.error('Please link your Alpaca account first');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }

    if (mode === "sell" && parseFloat(quantity) > ownedShares) {
      toast.error(`You only own ${ownedShares} shares of ${symbol}`);
      return;
    }

    if (mode === "buy" && totalCost > realAvailableCash) {
      toast.error('Insufficient buying power');
      return;
    }

    setStep("confirmation");
  };

  const confirmOrder = async () => {
    try {
      const orderData = {
        account_id: userAccountId,
        symbol,
        qty: quantity,
        side: mode,
        type: orderType,
        time_in_force: timeInForce,
        ...(orderType === "limit" && { limit_price: limitPrice })
      };

      console.log('Placing order:', orderData);
      const result = await placeOrder(userAccountId!, orderData);
      
      setOrderId(result.id);
      setStep("success");
      
      toast.success(`${mode.toUpperCase()} order placed successfully!`);
      
      // Save transfer record to database
      if (user) {
        await supabase
          .from('user_transfers')
          .insert({
            user_id: user.id,
            alpaca_account_id: userAccountId,
            amount: mode === "buy" ? -totalCost : totalCost,
            direction: mode === "buy" ? "OUTGOING" : "INCOMING",
            status: 'COMPLETE',
            transfer_type: 'TRADE',
            reason: `${mode.toUpperCase()} ${quantity} shares of ${symbol}`,
            alpaca_transfer_id: result.id
          });
      }
      
    } catch (error: any) {
      console.error('Order failed:', error);
      setErrorMessage(error.message || 'Order failed');
      setStep("error");
      toast.error(`Order failed: ${error.message}`);
    }
  };

  const resetModal = () => {
    setStep("form");
    setOrderId(null);
    setErrorMessage("");
    setQuantity("1");
    setLimitPrice("");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => resetModal(), 300);
  };

  const renderForm = () => (
    <div className="space-y-6">
      {/* Buy/Sell Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit mx-auto">
        <Button
          variant={mode === "sell" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("sell")}
          className={cn(
            "rounded-md px-8 py-2 text-sm font-medium transition-all",
            mode === "sell" 
              ? "bg-red-500 text-white hover:bg-red-600 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Sell
        </Button>
        <Button
          variant={mode === "buy" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("buy")}
          className={cn(
            "rounded-md px-8 py-2 text-sm font-medium transition-all",
            mode === "buy" 
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Buy
        </Button>
      </div>

      {/* Stock Info */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
        <div className="flex items-center gap-3">
          <CompanyLogo symbol={symbol} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{symbol}</span>
              <Badge variant="secondary" className="text-xs">STOCK</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">US Equity</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">${currentPrice.toFixed(2)}</div>
          <p className="text-sm text-emerald-600">Real-time Price</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Quantity
            {mode === "sell" && (
              <span className="text-xs text-slate-500 ml-2">
                (You own {ownedShares} shares)
              </span>
            )}
          </label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            min="1"
            max={mode === "sell" ? ownedShares : undefined}
            step="1"
            className="text-lg font-semibold"
          />
          {mode === "sell" && ownedShares === 0 && (
            <p className="text-xs text-red-500">You don't own any shares of {symbol}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Type</label>
          <Select value={orderType} onValueChange={(value: "market" | "limit") => setOrderType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {orderType === "limit" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Limit Price</label>
          <Input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={currentPrice.toFixed(2)}
            step="0.01"
            className="text-lg font-semibold"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Time in Force</label>
        <Select value={timeInForce} onValueChange={(value: "day" | "gtc") => setTimeInForce(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="gtc">Good Till Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order Summary */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border space-y-2">
        <div className="flex justify-between text-sm">
          <span>Estimated Value:</span>
          <span className="font-semibold">${estimatedValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Available Cash:</span>
          <span className="font-semibold text-emerald-600">${realAvailableCash.toFixed(2)}</span>
        </div>
        {mode === "buy" && totalCost > realAvailableCash && (
          <p className="text-red-500 text-sm">Insufficient buying power</p>
        )}
      </div>

      {/* Account Status */}
      {!isAccountLinked && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-orange-700 dark:text-orange-300">
            Alpaca account not linked. Please complete onboarding first.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePlaceOrder}
          disabled={
            !isAccountLinked || 
            loading || 
            (mode === "sell" && (ownedShares === 0 || parseFloat(quantity) > ownedShares)) ||
            (mode === "buy" && totalCost > realAvailableCash)
          }
          className={cn(
            "flex-1 h-12 text-base font-medium",
            mode === "buy" 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-red-500 hover:bg-red-600"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {mode === "buy" ? "Place Buy Order" : "Place Sell Order"}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleClose} className="px-8">
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Confirm Your Order</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Action:</span>
            <span className="font-semibold capitalize">{mode} {symbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-semibold">{quantity} shares</span>
          </div>
          <div className="flex justify-between">
            <span>Order Type:</span>
            <span className="font-semibold capitalize">{orderType}</span>
          </div>
          {orderType === "limit" && (
            <div className="flex justify-between">
              <span>Limit Price:</span>
              <span className="font-semibold">${limitPrice}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Estimated Value:</span>
            <span className="font-semibold">${estimatedValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={confirmOrder}
          disabled={loading}
          className={cn(
            "flex-1 h-12 text-base font-medium",
            mode === "buy" 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-red-500 hover:bg-red-600"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Confirm Order"
          )}
        </Button>
        <Button variant="outline" onClick={() => setStep("form")} className="px-8">
          Back
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="p-6">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-emerald-600 mb-2">Order Placed Successfully!</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Your {mode} order for {quantity} shares of {symbol} has been submitted.
        </p>
        {orderId && (
          <p className="text-sm text-slate-500 mt-2">Order ID: {orderId}</p>
        )}
        
        {orderType === "limit" && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Your limit order is pending. You can view and cancel it if needed.
          </p>
        )}
      </div>
      
      <div className="flex gap-3">
        {orderType === "limit" && (
          <PendingOrdersModal>
            <Button variant="outline" className="flex-1">
              View Pending Orders
            </Button>
          </PendingOrdersModal>
        )}
        <Button onClick={handleClose} className={cn("h-12 text-base font-medium", orderType === "limit" ? "flex-1" : "w-full")}>
          Close
        </Button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-6 text-center">
      <div className="p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Order Failed</h3>
        <p className="text-slate-600 dark:text-slate-400">
          {errorMessage || "There was an error placing your order."}
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button onClick={() => setStep("form")} variant="outline" className="flex-1">
          Try Again
        </Button>
        <Button onClick={handleClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-0 shadow-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold">
            {step === "form" && "Place Order"}
            {step === "confirmation" && "Confirm Order"}
            {step === "success" && "Order Complete"}
            {step === "error" && "Order Failed"}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === "form" && renderForm()}
          {step === "confirmation" && renderConfirmation()}
          {step === "success" && renderSuccess()}
          {step === "error" && renderError()}
        </div>
      </DialogContent>
    </Dialog>
  );
};