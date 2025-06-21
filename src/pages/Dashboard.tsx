
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import NewsCard from "@/components/NewsCard";
import PredictionCard from "@/components/PredictionCard";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppSidebar from "@/components/AppSidebar";
import MarketTicker from "@/components/MarketTicker";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Dashboard = () => {
  const newsItems = [
    {
      symbol: "AAPL",
      priority: "HIGH",
      title: "Apple announces record quarterly earnings, beats estimates by 15%",
      description: "Apple Inc. reported its strongest quarterly performance in company history, with revenue jumping 18% year-over-year driven by iPhone and services growth.",
      prediction: "+2.8% (24h)",
      confidence: 85,
      sentiment: "Bullish",
      category: "Technology"
    },
    {
      symbol: "TSLA", 
      priority: "MEDIUM",
      title: "Tesla recalls 200,000 vehicles due to software issue",
      sentiment: "Bearish",
      timeAgo: "5m ago"
    },
    {
      symbol: "NVDA",
      title: "NVIDIA partners with Microsoft for AI chip development", 
      priority: "HIGH",
      sentiment: "Bullish",
      timeAgo: "8m ago"
    }
  ];

  const predictions = [
    {
      symbol: "AAPL",
      current: 178.5,
      predicted: 182.3,
      change: 2.13,
      confidence: 78,
      timeframe: "24h"
    },
    {
      symbol: "TSLA", 
      current: 245.8,
      predicted: 238.9,
      change: -2.81,
      confidence: 65,
      timeframe: "24h"
    },
    {
      symbol: "NVDA",
      current: 712.4,
      predicted: 728.6, 
      change: 2.27,
      confidence: 82,
      timeframe: "24h"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-900">
        <AppSidebar />
        <SidebarInset>
          <MarketTicker />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">Live Market News</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                    <span className="text-slate-400 text-sm">Updated 2m ago</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-12">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {newsItems.map((item, index) => (
                      <NewsCard key={index} {...item} />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 h-[600px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">Other Headlines</h3>
                    <ScrollArea className="flex-1">
                      <div className="space-y-4 pr-4">
                        {newsItems.slice(1).map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                                {item.symbol}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className={`${item.sentiment === 'Bullish' ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs`}>
                                  {item.sentiment?.toUpperCase()}
                                </Badge>
                                <span className="text-slate-400">{item.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Add more dummy headlines to demonstrate scrolling */}
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={`extra-${i}`} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                                {i % 2 === 0 ? 'MSFT' : 'GOOGL'}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                                {i % 2 === 0 
                                  ? 'Microsoft announces new AI partnership with OpenAI' 
                                  : 'Google reports strong cloud growth in Q4 earnings'
                                }
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className={`${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs`}>
                                  {i % 2 === 0 ? 'BULLISH' : 'BEARISH'}
                                </Badge>
                                <span className="text-slate-400">{10 + i}m ago</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <AnalysisPipeline />
              
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">AI Predictions</h2>
                  <Link to="/predictions">
                    <Button variant="link" className="text-emerald-400 hover:text-emerald-300">
                      View more →
                    </Button>
                  </Link>
                </div>
                <p className="text-slate-400 mb-8">Keep up with the latest AI-generated market forecasts</p>
                
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <PredictionCard key={index} {...prediction} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
