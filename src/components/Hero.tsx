import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="px-6 py-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
            Take the <span className="text-emerald-400">Guesswork</span><br />
            out of <span className="text-blue-400">Investing</span>
          </h1>
          <p className="text-xl text-slate-300 mb-6 leading-relaxed">
            We believe smart investing should be powered by AI. That's why{" "}
            <span className="text-emerald-400 font-semibold">MarketSensorAI</span> takes the guesswork out of stock picks by keeping you 
            informed with real-time analysis and predictions.
          </p>
          <p className="text-lg text-slate-400 mb-8">
            As a member, you'll receive ongoing AI-powered market insights, so you can spend less 
            time researching and more time profiting.
          </p>
          <div className="flex items-center gap-4 mb-8">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                  Go to Dashboard →
                </Button>
              </Link>
            ) : (
              <Link to="/onboarding/email">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                  Start Free Trial →
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Demo header aligned at top */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-lg px-4 py-2 inline-block">
              <span className="text-blue-300 text-sm font-medium">Example Analysis Below ↓</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">AAPL</Badge>
                <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 text-xs">
                  Stock
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                  5 SOURCES
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                <div className="text-right">
                  <div className="text-white font-semibold">$201.08</div>
                  <div className="text-xs flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    +0.08 (0.04%)
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 leading-tight">AAPL: Positive developments support growth</h3>
            
            <p className="text-slate-300 mb-4 leading-relaxed">Comprehensive analysis based on 5 recent news articles</p>
            
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-semibold">AI Analysis</span>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                Based on AI analysis of 5 news articles, AAPL shows bullish sentiment.
              </p>
              
              <div className="mb-2">
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Confidence Level</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((dot) => (
                        <div
                          key={dot}
                          className="w-2 h-2 rounded-full bg-cyan-500"
                        />
                      ))}
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Market Sentiment</span>
                <span className="font-semibold text-emerald-400">Bullish</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 relative">
                <div className="absolute h-2 rounded-full w-1/3 right-0 bg-emerald-500"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-emerald-500 text-white text-xs">BULLISH</Badge>
              <span className="text-slate-400 text-sm">Investment and Corporate Developments</span>
            </div>

            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-medium">Detailed Analysis:</span> Strong positive indicators suggest AAPL may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Source Articles (5)
                <span className="text-xs text-slate-500 ml-2">
                  Weighted by significance
                </span>
              </h4>
              <div className="space-y-2">
                <div className="block p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium line-clamp-2 leading-tight">
                        Would Investing $10K in the Magnificent 7 Stocks in 2023 Have Made You Rich?
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Jun 28, 2025 at 07:01 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Weight:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        </div>
                        <span className="text-xs text-slate-500">(Low relevance to Apple's performance)</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
