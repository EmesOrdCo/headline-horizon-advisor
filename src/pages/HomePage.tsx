
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TrendingUp, Clock, FileText, ArrowRight, TrendingDown, ExternalLink, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarketTicker from "@/components/MarketTicker";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AnalysisPipeline from "@/components/AnalysisPipeline";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useMagnificent7Articles } from "@/hooks/useMagnificent7";
import { useIndexFundsArticles } from "@/hooks/useIndexFunds";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import CompanyLogo from "@/components/CompanyLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

const HomePage = () => {
  // Fetch live data for previews
  const { data: mag7Data, isLoading: mag7Loading } = useMagnificent7Articles();
  const { data: indexFundsData, isLoading: indexFundsLoading } = useIndexFundsArticles();
  const { data: stockPrices, isLoading: stockPricesLoading } = useStockPrices();
  const { getLogoUrl } = useCompanyLogos(['AAPL', 'SPY']);

  // Get preview data for Magnificent 7 (prioritize AAPL)
  const mag7Preview = useMemo(() => {
    if (!mag7Data || mag7Data.length === 0) return null;
    const aaplData = mag7Data.find(item => item.symbol === 'AAPL') || mag7Data[0];
    if (!aaplData) return null;

    const stockPrice = stockPrices?.find(price => price.symbol === aaplData.symbol);
    let sourceLinks = [];
    try {
      sourceLinks = JSON.parse(aaplData.source_links || '[]');
    } catch (e) {
      console.error('Error parsing source links:', e);
    }

    return { ...aaplData, stockPrice, sourceLinks };
  }, [mag7Data, stockPrices]);

  // Get preview data for Index Funds (prioritize SPY)
  const indexFundsPreview = useMemo(() => {
    if (!indexFundsData || indexFundsData.length === 0) return null;
    const spyData = indexFundsData.find(item => item.symbol === 'SPY') || indexFundsData[0];
    if (!spyData) return null;

    const stockPrice = stockPrices?.find(price => price.symbol === spyData.symbol);
    let sourceLinks = [];
    try {
      sourceLinks = JSON.parse(spyData.source_links || '[]');
    } catch (e) {
      console.error('Error parsing source links:', e);
    }

    return { ...spyData, stockPrice, sourceLinks };
  }, [indexFundsData, stockPrices]);
  useSEO({
    title: "AI-Powered Market Intelligence & Real-Time Predictions",
    description: "Empowering investors with AI-driven market intelligence and real-time predictions. Get comprehensive stock analysis, sentiment insights, and data-driven investment decisions.",
    canonical: "https://yourdomain.com/",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "name": "MarketSensorAI",
      "description": "AI-powered market intelligence and real-time stock predictions",
      "url": "https://yourdomain.com",
      "serviceType": "Financial Analysis",
      "provider": {
        "@type": "Organization",
        "name": "MarketSensorAI",
        "url": "https://yourdomain.com"
      },
      "areaServed": "US",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Market Intelligence Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "AI Stock Analysis",
            "description": "Real-time AI-powered stock sentiment analysis"
          },
          {
            "@type": "Offer",
            "name": "Market Predictions",
            "description": "AI-generated market forecasts and predictions"
          }
        ]
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero */}
      <div className="mt-0">
        <Hero />
      </div>

      {/* Market Analysis Previews */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Live Market Intelligence
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Get real-time AI-powered analysis across different market segments
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Magnificent 7 Live Platform */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white mb-2">Magnificent 7</CardTitle>
                      <p className="text-slate-400 text-sm">AI-powered analysis of tech giants</p>
                    </div>
                    <Link to="/magnificent-7">
                      <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                        View All 7 Stocks <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {mag7Loading || stockPricesLoading || !mag7Preview ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
                      <div className="text-xl font-medium text-slate-300">Loading live analysis...</div>
                      <div className="text-sm mt-2 text-slate-400">Fetching the latest market data...</div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Stock Header */}
                      <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <CompanyLogo symbol={mag7Preview.symbol} size="md" logoUrl={getLogoUrl(mag7Preview.symbol)} />
                          <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500 text-white">{mag7Preview.symbol}</Badge>
                            <span className="text-white font-semibold text-lg">
                              {mag7Preview.symbol} Corporation
                            </span>
                          </div>
                        </div>
                        
                        {mag7Preview.stockPrice && (
                          <div className="flex items-center gap-6 text-right">
                            <div>
                              <div className="text-slate-400 text-sm">Price</div>
                              <div className="text-white font-bold text-xl">
                                ${mag7Preview.stockPrice.price.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Change</div>
                              <div className={`font-semibold ${
                                mag7Preview.stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {mag7Preview.stockPrice.change >= 0 ? '+' : ''}{mag7Preview.stockPrice.change.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Change %</div>
                              <div className={`font-semibold ${
                                mag7Preview.stockPrice.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {mag7Preview.stockPrice.changePercent >= 0 ? '+' : ''}{mag7Preview.stockPrice.changePercent.toFixed(2)}%
                              </div>
                            </div>
                            {mag7Preview.stockPrice && (
                              <>
                                <div>
                                  <div className="text-slate-400 text-sm">Bid</div>
                                  <div className="text-red-400 font-semibold">
                                    ${(mag7Preview.stockPrice.price - 0.05).toFixed(2)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400 text-sm">Ask</div>
                                  <div className="text-emerald-400 font-semibold">
                                    ${(mag7Preview.stockPrice.price + 0.06).toFixed(2)}
                                  </div>
                                </div>
                              </>
                            )}
                            <Button variant="outline" className="border-slate-600 text-slate-300">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Chart
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column - Analysis */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Stock Badge and Title */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-blue-500 text-white">{mag7Preview.symbol}</Badge>
                              <Badge variant="secondary" className="bg-slate-500/20 text-slate-400">
                                Stock
                              </Badge>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-white">
                              {mag7Preview.title}
                            </h1>
                            
                            <p className="text-slate-300 leading-relaxed">
                              {mag7Preview.description}
                            </p>
                          </div>

                          {/* AI Analysis */}
                          <div className="bg-slate-700/30 border border-cyan-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingUp className="w-5 h-5 text-cyan-400" />
                              <span className="text-cyan-400 font-semibold text-lg">AI Analysis</span>
                            </div>
                            
                            <p className="text-slate-300 mb-4">
                              {mag7Preview.ai_reasoning || `Based on AI analysis of this news and market patterns, ${mag7Preview.symbol} shows ${mag7Preview.ai_sentiment?.toLowerCase() || 'neutral'} sentiment.`}
                            </p>
                            
                            {mag7Preview.ai_confidence && (
                              <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-slate-400">Confidence Level</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((dot) => (
                                      <div
                                        key={dot}
                                        className={`w-3 h-3 rounded-full ${
                                          dot <= Math.floor((mag7Preview.ai_confidence / 100) * 5) 
                                            ? 'bg-cyan-500' 
                                            : 'bg-slate-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Market Sentiment */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Market Sentiment</span>
                              <span className={`font-semibold text-lg ${
                                mag7Preview.ai_sentiment === 'Bullish' ? 'text-emerald-400' :
                                mag7Preview.ai_sentiment === 'Bearish' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {mag7Preview.ai_sentiment || 'Neutral'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                              <span>Bearish</span>
                              <span>Neutral</span>
                              <span>Bullish</span>
                            </div>
                            
                            <div className="w-full bg-slate-700 rounded-full h-3 relative">
                              <div className={`absolute h-3 rounded-full ${
                                mag7Preview.ai_sentiment === 'Bullish' ? 'w-4/5 right-0 bg-emerald-500' :
                                mag7Preview.ai_sentiment === 'Bearish' ? 'w-4/5 left-0 bg-red-500' :
                                'w-1/3 left-1/3 bg-yellow-500'
                              }`}></div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-4">
                              <Badge className={`text-white ${
                                mag7Preview.ai_sentiment === 'Bullish' ? 'bg-emerald-500' :
                                mag7Preview.ai_sentiment === 'Bearish' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}>
                                {mag7Preview.ai_sentiment?.toUpperCase() || 'NEUTRAL'}
                              </Badge>
                              <span className="text-slate-400 text-sm">
                                {mag7Preview.category || 'Technology Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Detailed Analysis */}
                          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                            <h3 className="text-cyan-400 font-semibold mb-3">Detailed Analysis:</h3>
                            <p className="text-slate-300 leading-relaxed">
                              {mag7Preview.ai_reasoning || `Mixed signals for ${mag7Preview.symbol} with ${mag7Preview.ai_sentiment?.toLowerCase() || 'neutral'} market impact expected. Analysis suggests balanced risk-reward profile in current environment.`}
                            </p>
                          </div>
                        </div>

                        {/* Right Column - Source Articles */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                            <h3 className="font-semibold text-slate-300">
                              Source Articles ({mag7Preview.sourceLinks?.length || 0})
                            </h3>
                            <span className="text-xs text-slate-500">Weighted by significance</span>
                          </div>
                          
                          <div className="space-y-3">
                            {mag7Preview.sourceLinks?.slice(0, 4).map((article: any, index: number) => (
                              <div key={index} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 hover:border-slate-500/50 transition-colors">
                                <h4 className="text-slate-300 font-medium text-sm leading-tight mb-2 line-clamp-2">
                                  {article.title}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                  <span>
                                    Published: {new Date(article.published_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Click headline or button to read full article
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 text-xs h-6">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Read More
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Index Funds Preview */}
            <Card className="bg-slate-800/30 border-slate-700 hover:border-purple-500/30 transition-all lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white mb-2">Index Funds</CardTitle>
                    <p className="text-slate-400 text-sm">Market index performance and insights</p>
                  </div>
                  <Link to="/index-funds">
                    <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                      View All Funds <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {indexFundsLoading || stockPricesLoading || !indexFundsPreview ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <div className="text-lg font-medium text-slate-300">Loading analysis...</div>
                    <div className="text-sm mt-2 text-slate-400">Fetching latest data...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CompanyLogo symbol={indexFundsPreview.symbol} size="sm" logoUrl={getLogoUrl(indexFundsPreview.symbol)} />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500 text-white text-xs">{indexFundsPreview.symbol}</Badge>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                              {indexFundsPreview.sourceLinks?.length || 0} SOURCES
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {indexFundsPreview.stockPrice && (
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            ${indexFundsPreview.stockPrice.price.toFixed(2)}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${
                            indexFundsPreview.stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {indexFundsPreview.stockPrice.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {indexFundsPreview.stockPrice.change >= 0 ? '+' : ''}{indexFundsPreview.stockPrice.change.toFixed(2)} 
                            ({indexFundsPreview.stockPrice.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {indexFundsPreview.title}
                      </h3>
                      <p className="text-slate-300 text-sm line-clamp-2">
                        {indexFundsPreview.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-white text-xs ${
                          indexFundsPreview.ai_sentiment === 'Bullish' ? 'bg-emerald-500' :
                          indexFundsPreview.ai_sentiment === 'Bearish' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          {indexFundsPreview.ai_sentiment?.toUpperCase() || 'NEUTRAL'}
                        </Badge>
                        {indexFundsPreview.ai_confidence && (
                          <span className="text-slate-400 text-xs">
                            {indexFundsPreview.ai_confidence}% confidence
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs">
                        {new Date(indexFundsPreview.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Features />
      
      <section id="how-it-works" className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-16">Powered by Advanced AI</h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-16 px-4">
            Our platform combines cutting-edge machine learning with real-time market 
            data to give you the edge you need.
          </p>
          <div className="max-w-7xl mx-auto px-4">
            <AnalysisPipeline />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;
