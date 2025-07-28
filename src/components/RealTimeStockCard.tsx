
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/CompanyLogo";
import { X, TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface StreamData {
  type: string;
  symbol?: string;
  price?: number;
  timestamp?: string;
  volume?: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface RealTimeStockCardProps {
  stock: UserStock;
  streamData?: StreamData;
  isConnected: boolean;
  onRemove: (stockId: string) => void;
}

const RealTimeStockCard = ({ stock, streamData, isConnected, onRemove }: RealTimeStockCardProps) => {
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (streamData?.price && previousPrice !== null) {
      if (streamData.price > previousPrice) {
        setPriceDirection('up');
      } else if (streamData.price < previousPrice) {
        setPriceDirection('down');
      }
    }
    if (streamData?.price) {
      setPreviousPrice(streamData.price);
    }
  }, [streamData?.price, previousPrice]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`flex items-center justify-between bg-slate-700/50 border rounded-lg p-3 min-w-[280px] transition-all duration-300 ${
      priceDirection === 'up' ? 'border-emerald-500/50 bg-emerald-900/10' : 
      priceDirection === 'down' ? 'border-red-500/50 bg-red-900/10' : 
      'border-slate-600'
    }`}>
      <div className="flex items-center gap-3">
        <CompanyLogo 
          symbol={stock.symbol} 
          size="sm" 
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white">{stock.symbol}</Badge>
            {isConnected ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-slate-400" />
            )}
          </div>
          <div className="text-xs text-slate-400">
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>
        
        <div className="text-right">
          {streamData?.price ? (
            <>
              <div className={`text-lg font-bold transition-colors duration-300 ${
                priceDirection === 'up' ? 'text-emerald-400' : 
                priceDirection === 'down' ? 'text-red-400' : 
                'text-white'
              }`}>
                ${formatPrice(streamData.price)}
              </div>
              
              {streamData?.bid && streamData?.ask && (
                <div className="text-xs text-slate-400 flex gap-2">
                  <span>Bid: ${formatPrice(streamData.bid)}</span>
                  <span>Ask: ${formatPrice(streamData.ask)}</span>
                </div>
              )}
              
              {streamData?.volume && (
                <div className="text-xs text-slate-400">
                  Vol: {streamData.volume.toLocaleString()}
                </div>
              )}
              
              {streamData?.timestamp && (
                <div className="text-xs text-slate-500">
                  {formatTime(streamData.timestamp)}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-400 text-sm">
              {isConnected ? 'Waiting for data...' : 'No live data'}
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(stock.id)}
        className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default RealTimeStockCard;
