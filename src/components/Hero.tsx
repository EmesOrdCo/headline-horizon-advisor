
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useMagnificent7Articles } from "@/hooks/useMagnificent7";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import CompanyLogo from "@/components/CompanyLogo";
import { useMemo } from "react";

const Hero = () => {
  const { user } = useAuth();
  
  // Fetch live Magnificent 7 data
  const { data: newsData, isLoading: newsLoading } = useMagnificent7Articles();
  const { data: stockPrices, isLoading: stockPricesLoading } = useStockPrices();
  const { getLogoUrl } = useCompanyLogos(['AAPL']);

  // Get the first available stock with news data (prioritize AAPL)
  const liveStockData = useMemo(() => {
    if (!newsData || newsData.length === 0) return null;
    
    // Find AAPL first, or any other stock with news
    const aaplData = newsData.find(item => item.symbol === 'AAPL');
    const stockData = aaplData || newsData[0];
    
    if (!stockData) return null;

    // Get corresponding stock price
    const stockPrice = stockPrices?.find(price => price.symbol === stockData.symbol);
    
    // Parse source links
    let sourceLinks = [];
    try {
      sourceLinks = JSON.parse(stockData.source_links || '[]');
    } catch (e) {
      console.error('Error parsing source links:', e);
    }

    return {
      ...stockData,
      stockPrice,
      sourceLinks
    };
  }, [newsData, stockPrices]);

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="order-1 lg:order-1">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Take the <span className="text-emerald-400">Guesswork</span><br />
            out of <span className="text-blue-400">Investing</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-4 sm:mb-6 leading-relaxed">
            We believe smart investing should be powered by AI. That's why{" "}
            <span className="text-emerald-400 font-semibold">MarketSensorAI</span> takes the guesswork out of stock picks by keeping you 
            informed with real-time analysis and predictions.
          </p>
          <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-8">
            As a member, you'll receive ongoing AI-powered market insights, so you can spend less 
            time researching and more time profiting.
          </p>
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  Go to Dashboard →
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  Start Free Trial →
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="space-y-4 order-2 lg:order-2">
          {/* Demo header aligned at top */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-lg px-3 sm:px-4 py-2 inline-block">
              <span className="text-blue-300 text-xs sm:text-sm font-medium">Example Analysis Below ↓</span>
            </div>
          </div>

          {newsLoading || stockPricesLoading || !liveStockData ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <div className="text-lg font-medium text-slate-300">Loading live analysis...</div>
                <div className="text-sm mt-2 text-slate-400">Fetching the latest Magnificent 7 data...</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-emerald-500/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CompanyLogo 
                      symbol={liveStockData.symbol} 
                      size="sm"
                      logoUrl={getLogoUrl(liveStockData.symbol)}
                    />
                    <Badge className="bg-blue-500 text-white text-xs">{liveStockData.symbol}</Badge>
                  </div>
                  <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 text-xs">
                    Stock
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                    {liveStockData.sourceLinks?.length || 0} SOURCES
                  </Badge>
                </div>
                
                {liveStockData.stockPrice && (
                  <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 self-start sm:self-auto">
                    <div className="text-right">
                      <div className="text-white font-semibold text-sm sm:text-base">
                        ${liveStockData.stockPrice.price.toFixed(2)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        liveStockData.stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {liveStockData.stockPrice.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {liveStockData.stockPrice.change >= 0 ? '+' : ''}{liveStockData.stockPrice.change.toFixed(2)} 
                        ({liveStockData.stockPrice.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 leading-tight">
                {liveStockData.title}
              </h3>
              
              <p className="text-slate-300 mb-4 leading-relaxed text-sm sm:text-base">
                {liveStockData.description}
              </p>
            
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold text-sm sm:text-base">AI Analysis</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mb-3">
                  {liveStockData.ai_reasoning || `Based on AI analysis of ${liveStockData.sourceLinks?.length || 0} news articles, ${liveStockData.symbol} shows ${liveStockData.ai_sentiment?.toLowerCase() || 'neutral'} sentiment.`}
                </p>
                
                {liveStockData.ai_confidence && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Confidence Level</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div
                              key={dot}
                              className={`w-2 h-2 rounded-full ${
                                dot <= Math.floor((liveStockData.ai_confidence / 100) * 5) 
                                  ? 'bg-cyan-500' 
                                  : 'bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            
              <div className="mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-slate-400">Market Sentiment</span>
                  <span className={`font-semibold ${
                    liveStockData.ai_sentiment === 'Bullish' ? 'text-emerald-400' :
                    liveStockData.ai_sentiment === 'Bearish' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {liveStockData.ai_sentiment || 'Neutral'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 relative">
                  <div className={`absolute h-2 rounded-full ${
                    liveStockData.ai_sentiment === 'Bullish' ? 'w-4/5 right-0 bg-emerald-500' :
                    liveStockData.ai_sentiment === 'Bearish' ? 'w-4/5 left-0 bg-red-500' :
                    'w-1/3 left-1/3 bg-yellow-500'
                  }`}></div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`text-white text-xs ${
                  liveStockData.ai_sentiment === 'Bullish' ? 'bg-emerald-500' :
                  liveStockData.ai_sentiment === 'Bearish' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}>
                  {liveStockData.ai_sentiment?.toUpperCase() || 'NEUTRAL'}
                </Badge>
                <span className="text-slate-400 text-xs sm:text-sm">{liveStockData.category || 'Market Analysis'}</span>
              </div>

              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
                <p className="text-xs leading-relaxed text-slate-300">
                  <span className="text-cyan-400 font-medium">Live Analysis:</span> {liveStockData.ai_reasoning || `Current market analysis for ${liveStockData.symbol} based on recent developments and news coverage.`}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4" />
                  Source Articles ({liveStockData.sourceLinks?.length || 0})
                  <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                    Live from news feeds
                  </span>
                </h4>
                <div className="space-y-2">
                  {liveStockData.sourceLinks?.slice(0, 2).map((article: any, index: number) => (
                    <div key={index} className="block p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-2 leading-tight">
                            {article.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(article.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">Source:</span>
                            <span className="text-xs text-slate-500">{new URL(article.url).hostname}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}
                  {liveStockData.sourceLinks?.length > 2 && (
                    <div className="text-center">
                      <Link to="/magnificent-7" className="text-xs text-cyan-400 hover:text-cyan-300">
                        View all {liveStockData.sourceLinks.length} articles →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
