import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, 
  Plus, 
  BarChart3, 
  AlertTriangle, 
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import AIAnalysisTab from "@/components/StockDetail/AIAnalysisTab";

const StockAnalysis: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    if (value === 'trading-view') {
      navigate(`/stock-chart/${symbol}`);
    } else if (value === 'all-data') {
      navigate(`/stock-data/${symbol}`);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={() => navigate(`/stock-chart/${symbol}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-white font-medium">{symbol}</span>
            <span className="text-slate-400">AI Analysis</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-sm">Back to Watchlist</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="ml-1">Indicators</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="ml-1">Alert</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-sm">
            <RotateCcw className="w-4 h-4" />
            <span className="ml-1">Replay</span>
          </Button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          {/* Tab Navigation */}
          <Tabs value="ai-analysis" onValueChange={handleTabChange}>
            <TabsList className="bg-slate-700/50 border border-slate-600 h-8">
              <TabsTrigger 
                value="trading-view" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Trading View
              </TabsTrigger>
              <TabsTrigger 
                value="ai-analysis" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                AI Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="all-data" 
                className="text-sm px-3 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                All Data
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900 overflow-y-auto">
        <div className="p-6">
          <AIAnalysisTab 
            symbol={symbol || 'NFLX'} 
            stockInfo={{
              price: 1180.76,
              change: 3.98,
              changePercent: 0.34
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;