import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import AIAnalysisTab from "@/components/StockDetail/AIAnalysisTab";

const AIQualitativeAnalysis = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  // Mock stock info - in real app this would come from API
  const stockInfo = {
    price: 267.93,
    change: 0.23,
    changePercent: 0.09
  };

  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{symbol?.slice(0, 1)}</span>
            </div>
            <span className="text-white font-medium">{symbol}</span>
            <span className="text-slate-400">1D</span>
            <span className="text-slate-400">NASDAQ</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => navigate('/watchlist')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Watchlist
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* View Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock/${symbol}/trading`)}
            >
              Trading View
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              AI Qualitative Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => navigate(`/stock/${symbol}/data`)}
            >
              All Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <AIAnalysisTab symbol={symbol || 'NFLX'} stockInfo={stockInfo} />
      </div>
    </div>
  );
};

export default AIQualitativeAnalysis;