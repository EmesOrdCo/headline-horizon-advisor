
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowLeft, Clock, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import { ScrollArea } from "@/components/ui/scroll-area";

const ConfidenceDots = ({ confidence }: { confidence: number }) => {
  // Convert percentage to dots (0-100% -> 0-5 dots)
  const dots = Math.round((confidence / 100) * 5);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= dots ? 'bg-slate-400' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};

const DetailedAnalysis = () => {
  const { symbol } = useParams();
  const upperSymbol = symbol?.toUpperCase() || 'AAPL';

  const influencingHeadlines = [
    {
      title: "Apple announces record quarterly earnings, beats estimates by 15%",
      impact: "Bullish",
      weight: 85,
      timeAgo: "2h ago",
      description: "Strong earnings typically drive immediate price increases for 24-48 hours"
    },
    {
      title: "Apple introduces new AI features in latest iOS update",
      impact: "Bullish", 
      weight: 65,
      timeAgo: "4h ago",
      description: "AI integration trends show sustained positive market response"
    },
    {
      title: "Tech sector faces regulatory scrutiny in Europe",
      impact: "Bearish",
      weight: 30,
      timeAgo: "6h ago", 
      description: "Regulatory concerns typically have moderate short-term impact"
    },
    {
      title: "Supply chain disruptions affect manufacturing",
      impact: "Bearish",
      weight: 25,
      timeAgo: "8h ago",
      description: "Supply issues show mixed historical correlation with stock performance"
    }
  ];

  const timeHorizonPredictions = [
    {
      period: "1 Day",
      current: 178.5,
      predicted: 182.3,
      change: 2.13,
      confidence: 78,
      reasoning: "Strong earnings momentum typically sustains for 24-48 hours based on historical patterns"
    },
    {
      period: "1 Week", 
      current: 178.5,
      predicted: 185.7,
      change: 4.03,
      confidence: 65,
      reasoning: "Positive earnings surprise combined with AI narrative supports week-long uptrend"
    },
    {
      period: "1 Month",
      current: 178.5,
      predicted: 192.4,
      change: 7.78,
      confidence: 52,
      reasoning: "Long-term AI adoption and market expansion potential drive monthly outlook"
    },
    {
      period: "1 Quarter",
      current: 178.5,
      predicted: 205.2,
      change: 14.96,
      confidence: 45,
      reasoning: "Quarterly predictions account for upcoming product cycles and market conditions"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Detailed Analysis</h1>
            <Badge className="bg-blue-500 text-white text-lg px-3 py-1">{upperSymbol}</Badge>
          </div>
          <p className="text-slate-400">AI-powered prediction analysis with supporting evidence</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Headlines Analysis */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Influencing Headlines</h2>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {influencingHeadlines.map((headline, index) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium text-sm leading-tight flex-1 mr-3">
                        {headline.title}
                      </h3>
                      <Badge className={`${headline.impact === 'Bullish' ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs`}>
                        {headline.impact.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                      {headline.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">{headline.timeAgo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Weight:</span>
                        <ConfidenceDots confidence={headline.weight} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Time Horizon Predictions */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Multi-Timeframe Predictions</h2>
            </div>
            
            <div className="space-y-6">
              {timeHorizonPredictions.map((prediction, index) => {
                const isPositive = prediction.change > 0;
                return (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">{prediction.period}</h3>
                      <Badge className={`${isPositive ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                        {isPositive ? (
                          <><TrendingUp className="w-3 h-3 mr-1" /> +{prediction.change.toFixed(2)}%</>
                        ) : (
                          <><TrendingDown className="w-3 h-3 mr-1" /> {prediction.change.toFixed(2)}%</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Current</div>
                        <div className="text-lg font-bold text-white">${prediction.current}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Predicted</div>
                        <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          ${prediction.predicted}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-400">Confidence</span>
                        <ConfidenceDots confidence={prediction.confidence} />
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {prediction.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedAnalysis;
