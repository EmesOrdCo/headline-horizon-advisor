import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, InfoIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradingModalProps {
  children: React.ReactNode;
  symbol: string;
  currentPrice: number;
  initialMode?: "buy" | "sell";
}

export const TradingModal = ({ children, symbol, currentPrice, initialMode = "buy" }: TradingModalProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"buy" | "sell">(initialMode);
  const [amount, setAmount] = useState("10");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [leverage, setLeverage] = useState("X1");
  const [orderType, setOrderType] = useState("Market Order");

  const exposure = parseFloat(amount) || 0;
  const shares = exposure / currentPrice;
  const estimatedCosts = 0.02;
  const availableUSD = 0.00;

  const leverageOptions = ["X1", "X2", "X5"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl p-0 overflow-hidden">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 pb-0">
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="px-4 pb-4">
          <div className="flex bg-gray-100 rounded-full p-1 w-fit mx-auto">
            <Button
              variant={mode === "sell" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("sell")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all",
                mode === "sell" 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              Short
            </Button>
            <Button
              variant={mode === "buy" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("buy")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all",
                mode === "buy" 
                  ? "bg-gray-800 text-white hover:bg-gray-900" 
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              Buy
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold border-2 border-gray-200 rounded-lg h-12"
                placeholder="10"
              />
            </div>
            {exposure < 10 && (
              <p className="text-red-500 text-sm">Deposit $10 in order to open this trade</p>
            )}
          </div>

          {/* Exposure and Shares */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">${exposure.toFixed(2)} Exposure | {shares.toFixed(2)} Shares</span>
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </div>

          {/* Stop Loss and Take Profit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Stop Loss</label>
              <Input
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="-$5.00"
                className="border-gray-200 text-red-500 placeholder:text-red-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Take Profit</label>
              <Input
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="$10.00"
                className="border-gray-200 text-green-500 placeholder:text-green-300"
              />
            </div>
          </div>

          {/* Leverage */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">Leverage</label>
            <div className="flex gap-2">
              {leverageOptions.map((option) => (
                <Button
                  key={option}
                  variant={leverage === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLeverage(option)}
                  className={cn(
                    "rounded-full px-4 py-2",
                    leverage === option 
                      ? "bg-green-500 text-white hover:bg-green-600 border-green-500" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Note, higher leverage can amplify profit and loss, putting your capital at risk.
            </p>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{symbol}</span>
                  <Badge variant="secondary" className="text-xs">CFD</Badge>
                </div>
                <p className="text-sm text-gray-600">NVIDIA Corporation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-gray-400" />
                <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-green-600">▲1.87%</p>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Order Type</span>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger className="w-auto border-none text-right text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Market Order">Market Order</SelectItem>
                <SelectItem value="Limit Order">Limit Order</SelectItem>
                <SelectItem value="Stop Order">Stop Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Opening Costs */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Estimated Opening Costs</span>
              <InfoIcon className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium">${estimatedCosts.toFixed(2)}</span>
          </div>

          {/* Available USD */}
          <div className="flex justify-between items-center">
            <Select defaultValue="usd">
              <SelectTrigger className="w-auto border-none text-sm font-medium text-green-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">Available USD</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">${availableUSD.toFixed(2)}</span>
          </div>

          {/* Deposit Button */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-12 text-base font-medium mt-6">
            💰 Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};