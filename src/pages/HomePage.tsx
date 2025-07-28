
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TrendingUp, Clock, FileText, ArrowRight, TrendingDown, ExternalLink } from "lucide-react";
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
            {/* Magnificent 7 Preview */}
            <Card className="bg-slate-800/30 border-slate-700 hover:border-emerald-500/30 transition-all">
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
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <div className="text-lg font-medium text-slate-300">Loading analysis...</div>
                    <div className="text-sm mt-2 text-slate-400">Fetching latest data...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CompanyLogo symbol={mag7Preview.symbol} size="sm" logoUrl={getLogoUrl(mag7Preview.symbol)} />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500 text-white text-xs">{mag7Preview.symbol}</Badge>
                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                              {mag7Preview.sourceLinks?.length || 0} SOURCES
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {mag7Preview.stockPrice && (
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            ${mag7Preview.stockPrice.price.toFixed(2)}
                          </div>
                          <div className={`text-xs flex items-center gap-1 ${
                            mag7Preview.stockPrice.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {mag7Preview.stockPrice.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {mag7Preview.stockPrice.change >= 0 ? '+' : ''}{mag7Preview.stockPrice.change.toFixed(2)} 
                            ({mag7Preview.stockPrice.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {mag7Preview.title}
                      </h3>
                      <p className="text-slate-300 text-sm line-clamp-2">
                        {mag7Preview.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-white text-xs ${
                          mag7Preview.ai_sentiment === 'Bullish' ? 'bg-emerald-500' :
                          mag7Preview.ai_sentiment === 'Bearish' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          {mag7Preview.ai_sentiment?.toUpperCase() || 'NEUTRAL'}
                        </Badge>
                        {mag7Preview.ai_confidence && (
                          <span className="text-slate-400 text-xs">
                            {mag7Preview.ai_confidence}% confidence
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs">
                        {new Date(mag7Preview.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Index Funds Preview */}
            <Card className="bg-slate-800/30 border-slate-700 hover:border-purple-500/30 transition-all">
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
