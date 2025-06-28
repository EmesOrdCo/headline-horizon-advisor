
import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import MarketTicker from "@/components/MarketTicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ExternalLink, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

// Demo data for biggest movers
const demoMovers = {
  gainers: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 875.42,
      change: 67.23,
      changePercent: 8.32,
      volume: "45.2M",
      headlines: [
        {
          title: "NVIDIA Reports Record Q4 Revenue Driven by AI Demand",
          summary: "Strong datacenter growth and AI chip sales exceed expectations",
          url: "#",
          publishedAt: "2 hours ago"
        },
        {
          title: "Major Cloud Providers Increase NVIDIA GPU Orders",
          summary: "Amazon, Microsoft, and Google expand AI infrastructure investments",
          url: "#",
          publishedAt: "4 hours ago"
        }
      ]
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      price: 198.87,
      change: 12.45,
      changePercent: 6.68,
      volume: "78.3M",
      headlines: [
        {
          title: "Tesla Announces New Gigafactory in Texas Expansion",
          summary: "Production capacity to increase by 40% with new facility",
          url: "#",
          publishedAt: "1 hour ago"
        }
      ]
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc",
      price: 512.33,
      change: 18.92,
      changePercent: 3.84,
      volume: "32.1M",
      headlines: [
        {
          title: "Meta's AI Revenue Streams Show Strong Growth",
          summary: "Advertising technology improvements drive better targeting",
          url: "#",
          publishedAt: "3 hours ago"
        }
      ]
    }
  ],
  losers: [
    {
      symbol: "AAPL",
      name: "Apple Inc",
      price: 187.23,
      change: -8.45,
      changePercent: -4.32,
      volume: "56.7M",
      headlines: [
        {
          title: "Apple Faces Supply Chain Challenges in China",
          summary: "Manufacturing delays impact iPhone production timeline",
          url: "#",
          publishedAt: "1 hour ago"
        },
        {
          title: "Regulatory Concerns Over App Store Policies",
          summary: "EU investigation into antitrust practices continues",
          url: "#",
          publishedAt: "5 hours ago"
        }
      ]
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc",
      price: 142.67,
      change: -5.23,
      changePercent: -3.54,
      volume: "41.2M",
      headlines: [
        {
          title: "Amazon AWS Revenue Growth Slows in Q4",
          summary: "Cloud competition intensifies as growth rate declines",
          url: "#",
          publishedAt: "2 hours ago"
        }
      ]
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc",
      price: 138.45,
      change: -3.87,
      changePercent: -2.72,
      volume: "28.9M",
      headlines: [
        {
          title: "Google Search Ad Revenue Shows Unexpected Decline",
          summary: "Competition from AI chatbots affects traditional search",
          url: "#",
          publishedAt: "4 hours ago"
        }
      ]
    }
  ]
};

const MoverCard = ({ stock, isGainer }: { stock: any, isGainer: boolean }) => {
  const [showHeadlines, setShowHeadlines] = useState(false);

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-slate-700 hover:border-emerald-500/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${isGainer ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
              {stock.symbol}
            </Badge>
            <div>
              <h3 className="text-white font-semibold">{stock.name}</h3>
              <p className="text-slate-400 text-sm">Vol: {stock.volume}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-xl font-bold">${stock.price}</div>
            <div className={`flex items-center gap-1 text-sm ${
              isGainer ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isGainer ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isGainer ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHeadlines(!showHeadlines)}
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            {showHeadlines ? 'Hide' : 'Show'} Headlines ({stock.headlines.length})
          </Button>
          <Link to={`/analysis/${stock.symbol}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Detailed Analysis
            </Button>
          </Link>
        </div>

        {showHeadlines && (
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-700">
            <h4 className="text-slate-300 font-medium text-sm">Related Headlines</h4>
            {stock.headlines.map((headline: any, index: number) => (
              <div
                key={index}
                className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <h5 className="text-white font-medium text-sm mb-1 line-clamp-2">
                  {headline.title}
                </h5>
                <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                  {headline.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">{headline.publishedAt}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BiggestMovers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNav />
      
      {/* Market Ticker */}
      <div className="pt-16">
        <MarketTicker />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Biggest Movers</h1>
          <p className="text-slate-400">Stocks with the largest price movements today</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              DEMO DATA
            </Badge>
            <span className="text-slate-500 text-sm">Updated every 15 minutes during market hours</span>
          </div>
        </div>

        {/* Top Gainers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Top Gainers</h2>
            <Badge className="bg-emerald-500 text-white">
              {demoMovers.gainers.length} stocks
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {demoMovers.gainers.map((stock, index) => (
              <MoverCard key={stock.symbol} stock={stock} isGainer={true} />
            ))}
          </div>
        </div>

        {/* Top Losers Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Top Losers</h2>
            <Badge className="bg-red-500 text-white">
              {demoMovers.losers.length} stocks
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {demoMovers.losers.map((stock, index) => (
              <MoverCard key={stock.symbol} stock={stock} isGainer={false} />
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
          <p className="text-slate-400 text-sm">
            <strong className="text-white">Note:</strong> This page currently displays demo data for styling purposes. 
            Real-time data integration and AI analysis will be implemented in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiggestMovers;
