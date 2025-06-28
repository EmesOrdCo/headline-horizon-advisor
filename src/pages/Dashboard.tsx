
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import NewsCard from "@/components/NewsCard";
import MarketTicker from "@/components/MarketTicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNews, useFetchNews } from "@/hooks/useNews";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: newsData, isLoading, refetch } = useNews();
  const { data: stockPrices, isLoading: isPricesLoading } = useStockPrices();
  const fetchNews = useFetchNews();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState<string>('');
  const { toast } = useToast();

  // Primary assets for main analysis
  const MAGNIFICENT_7 = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
  const MAJOR_INDEX_FUNDS = ['SPY', 'QQQ', 'DIA']; // Match the ticker exactly

  const PRIMARY_ASSETS = [...MAGNIFICENT_7, ...MAJOR_INDEX_FUNDS];

  // Function to calculate similarity between two headlines
  const calculateSimilarity = (headline1: string, headline2: string): number => {
    const words1 = headline1.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const words2 = headline2.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
  };

  // Function to check if headlines are too similar
  const areHeadlinesSimilar = (headline1: string, headline2: string): boolean => {
    const similarity = calculateSimilarity(headline1, headline2);
    return similarity > 25; // Consider similar if more than 25% word overlap
  };

  // Get stock price for a symbol
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(stock => stock.symbol === symbol);
  };

  // Get main analysis articles (one per primary asset with AI analysis)
  const mainAnalysisArticles = PRIMARY_ASSETS.map(symbol => {
    return newsData?.find(item => 
      item.symbol === symbol && 
      item.ai_confidence && 
      item.ai_sentiment
    );
  }).filter(Boolean);

  // Get ALL recent headlines in chronological order (front-page news only)
  const allRecentHeadlines = newsData?.filter(item => {
    // Front-page news typically has higher confidence and recent publish dates
    const isRecent = new Date(item.published_at).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    const isHighConfidence = item.ai_confidence && item.ai_confidence > 60;
    const hasGoodSentiment = item.ai_sentiment && item.ai_sentiment !== 'Neutral';
    
    return isRecent && (isHighConfidence || hasGoodSentiment);
  }).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()) || [];

  // Generate composite headline based on source articles with uniqueness checking
  const generateCompositeHeadline = async (item: any, existingHeadlines: string[] = []): Promise<string> => {
    const symbol = item.symbol;
    const sentiment = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Parse source links to get article titles
    let sourceArticles = [];
    try {
      sourceArticles = item.source_links ? JSON.parse(item.source_links) : [];
    } catch (error) {
      console.error('Error parsing source links:', error);
    }

    // Create unique headlines based on symbol-specific context and source content
    let generatedHeadline = '';
    
    if (sourceArticles.length > 0) {
      const titles = sourceArticles.map((article: any) => article.title.toLowerCase());
      
      // Symbol-specific headline generation with unique approaches
      switch (symbol) {
        case 'AAPL':
          if (titles.some(t => t.includes('iphone') || t.includes('mac') || t.includes('apple'))) {
            generatedHeadline = sentiment === 'bullish' 
              ? "Apple's Hardware Innovation Cycle Accelerates Consumer Demand Projections"
              : "Consumer Electronics Giant Faces Shifting Market Dynamics in Key Categories";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Cupertino Tech Leader Expands Ecosystem Integration Across Product Lines"
              : "Premium Device Manufacturer Navigates Supply Chain Complexities";
          }
          break;

        case 'MSFT':
          if (titles.some(t => t.includes('cloud') || t.includes('azure') || t.includes('ai'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Enterprise Cloud Architecture Drives Next-Generation Business Transformation"
              : "Software Infrastructure Provider Encounters Competitive Headwinds in Cloud Services";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Productivity Software Pioneer Revolutionizes Corporate Digital Workflows"
              : "Technology Conglomerate Adjusts Strategy Amid Evolving Enterprise Needs";
          }
          break;

        case 'GOOGL':
          if (titles.some(t => t.includes('search') || t.includes('advertising') || t.includes('youtube'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Digital Advertising Ecosystem Captures Unprecedented User Engagement Metrics"
              : "Search Engine Authority Confronts Regulatory Scrutiny Over Market Position";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Alphabet's Moonshot Ventures Generate Breakthrough Technology Applications"
              : "Internet Conglomerate Reassesses Investment Priorities Across Multiple Verticals";
          }
          break;

        case 'AMZN':
          if (titles.some(t => t.includes('aws') || t.includes('retail') || t.includes('logistics'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "E-Commerce Infrastructure Backbone Enables Global Supply Chain Optimization"
              : "Retail Distribution Network Faces Operational Cost Pressures Across Regions";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Everything Store Concept Expands Into Untapped Consumer Service Categories"
              : "Logistics Empire Recalibrates Fulfillment Operations for Efficiency Gains";
          }
          break;

        case 'NVDA':
          if (titles.some(t => t.includes('gpu') || t.includes('chip') || t.includes('ai'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Graphics Processing Revolution Unlocks Artificial Intelligence Computing Potential"
              : "Semiconductor Specialist Encounters Production Bottlenecks in High-Demand Chips";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Visual Computing Pioneer Transforms Gaming Industry Performance Standards"
              : "Hardware Innovation Leader Adapts to Cyclical Semiconductor Market Conditions";
          }
          break;

        case 'TSLA':
          if (titles.some(t => t.includes('electric') || t.includes('vehicle') || t.includes('musk'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Electric Vehicle Manufacturing Scales Sustainable Transportation Adoption Worldwide"
              : "Automotive Disruptor Encounters Production Challenges in Global Expansion Plans";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Clean Energy Ecosystem Integrates Battery Technology with Solar Solutions"
              : "Transportation Innovator Navigates Regulatory Hurdles in Multiple Markets";
          }
          break;

        case 'META':
          if (titles.some(t => t.includes('metaverse') || t.includes('facebook') || t.includes('reality'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Virtual Reality Platform Architecture Redefines Social Connection Paradigms"
              : "Social Media Conglomerate Faces User Privacy Concerns Across Global Markets";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Digital Social Framework Monetizes Creator Economy Through Advanced Analytics"
              : "Communication Platform Provider Adjusts Content Moderation Policies Globally";
          }
          break;

        case 'SPY':
          if (titles.some(t => t.includes('market') || t.includes('s&p') || t.includes('index'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Broad Market Index Reflects Institutional Confidence in Economic Recovery Trajectory"
              : "Diversified Equity Benchmark Shows Volatility Amid Macroeconomic Uncertainty";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "S&P 500 Tracking Fund Benefits from Corporate Earnings Growth Across Sectors"
              : "Large-Cap Equity Composite Experiences Rotation Between Growth and Value Segments";
          }
          break;

        case 'QQQ':
          if (titles.some(t => t.includes('nasdaq') || t.includes('tech') || t.includes('growth'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Technology-Heavy Index Fund Capitalizes on Innovation Sector Momentum"
              : "NASDAQ Composite Tracker Faces Headwinds from Interest Rate Sensitivity";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Growth-Oriented Equity Fund Attracts Capital Flows from Institutional Investors"
              : "Tech-Focused Investment Vehicle Adjusts to Changing Market Leadership Dynamics";
          }
          break;

        case 'DIA':
          if (titles.some(t => t.includes('dow') || t.includes('industrial') || t.includes('blue'))) {
            generatedHeadline = sentiment === 'bullish'
              ? "Industrial Average Tracking Fund Demonstrates Resilience in Manufacturing Sectors"
              : "Blue-Chip Equity Index Encounters Headwinds from Trade Policy Uncertainties";
          } else {
            generatedHeadline = sentiment === 'bullish'
              ? "Dow Jones Composite Fund Attracts Conservative Investors Seeking Stability"
              : "Traditional Industrial Index Shows Mixed Performance Across Cyclical Sectors";
          }
          break;

        default:
          generatedHeadline = sentiment === 'bullish'
            ? `${symbol} Demonstrates Strong Fundamental Performance in Current Market Environment`
            : `${symbol} Faces Market Headwinds Requiring Strategic Operational Adjustments`;
      }
    } else {
      // Unique fallback headlines when no source articles available
      const fallbackHeadlines = {
        'AAPL': sentiment === 'bullish' 
          ? "Consumer Technology Leader Maintains Premium Market Position Through Innovation"
          : "Hardware Manufacturer Encounters Competitive Pressures in Core Product Categories",
        'MSFT': sentiment === 'bullish'
          ? "Enterprise Software Architect Strengthens Cloud Computing Market Leadership"
          : "Technology Infrastructure Provider Faces Integration Challenges Across Platforms",
        'GOOGL': sentiment === 'bullish'
          ? "Search Technology Pioneer Expands Artificial Intelligence Research Capabilities"
          : "Digital Platform Operator Addresses Privacy Regulations Across Global Markets",
        'AMZN': sentiment === 'bullish'
          ? "E-Commerce Infrastructure Leader Optimizes Global Fulfillment Network Operations"
          : "Online Retail Platform Experiences Margin Pressure from Logistics Investments",
        'NVDA': sentiment === 'bullish'
          ? "Semiconductor Design Specialist Accelerates AI Computing Chip Development"
          : "Graphics Processing Manufacturer Navigates Cyclical Demand Fluctuations",
        'TSLA': sentiment === 'bullish'
          ? "Electric Mobility Pioneer Advances Autonomous Driving Technology Integration"
          : "Sustainable Transportation Company Encounters Production Scaling Challenges",
        'META': sentiment === 'bullish'
          ? "Social Platform Innovator Develops Next-Generation Virtual Communication Tools"
          : "Digital Advertising Network Adapts to Evolving User Privacy Expectations",
        'SPY': sentiment === 'bullish'
          ? "Broad Market Benchmark Reflects Diversified Economic Growth Across Industries"
          : "Large-Cap Index Fund Shows Cautious Performance Amid Market Uncertainty",
        'QQQ': sentiment === 'bullish'
          ? "Technology Sector Fund Captures Innovation Investment Trends and Growth"
          : "NASDAQ Index Tracker Experiences Volatility from Interest Rate Sensitivity",
        'DIA': sentiment === 'bullish'
          ? "Industrial Sector Index Demonstrates Stability in Traditional Manufacturing Base"
          : "Blue-Chip Stock Fund Faces Challenges from Global Trade Dynamics"
      };
      
      generatedHeadline = fallbackHeadlines[symbol] || `${symbol} Maintains Market Position Through Strategic Analysis`;
    }

    // Check for similarity with existing headlines
    const maxAttempts = 5;
    let attempts = 0;
    let finalHeadline = generatedHeadline;

    while (attempts < maxAttempts && existingHeadlines.some(existing => areHeadlinesSimilar(finalHeadline, existing))) {
      attempts++;
      console.log(`Headline similarity detected for ${symbol}, generating alternative (attempt ${attempts})`);
      
      // Generate alternative unique headlines with specific uniqueness prompts
      const alternativeHeadlines = {
        'AAPL': [
          sentiment === 'bullish' ? "iPhone Maker Strengthens Wearable Technology Market Dominance" : "Smartphone Leader Confronts Regulatory Challenges in App Store Operations",
          sentiment === 'bullish' ? "Silicon Valley Icon Drives Services Revenue Through Ecosystem Lock-in Strategy" : "Technology Hardware Veteran Experiences Supply Chain Disruptions",
          sentiment === 'bullish' ? "Premium Electronics Brand Expands Health Technology Integration Initiatives" : "Mobile Device Pioneer Adjusts to Changing Consumer Preferences",
          sentiment === 'bullish' ? "Consumer Electronics Innovator Accelerates Augmented Reality Development Timeline" : "Cupertino-Based Company Faces Antitrust Investigations Worldwide",
          sentiment === 'bullish' ? "Hardware Design Leader Transforms Manufacturing Efficiency Standards" : "Luxury Technology Provider Encounters Market Saturation Challenges"
        ],
        'MSFT': [
          sentiment === 'bullish' ? "Seattle Software Giant Dominates Hybrid Work Solution Market" : "Office Suite Provider Struggles with Subscription Model Adoption",
          sentiment === 'bullish' ? "Cloud Computing Leader Revolutionizes Enterprise Data Management" : "Windows Operating System Faces Open Source Competition Pressure",
          sentiment === 'bullish' ? "Business Software Pioneer Integrates Gaming Division for Growth" : "Enterprise Technology Vendor Confronts Cybersecurity Breach Concerns",
          sentiment === 'bullish' ? "Productivity Platform Creator Enhances AI-Powered Collaboration Tools" : "Software Licensing Model Experiences Regulatory Scrutiny",
          sentiment === 'bullish' ? "Corporate Technology Partner Streamlines Remote Work Infrastructure" : "Traditional Software Company Adapts to SaaS Market Dynamics"
        ],
        'GOOGL': [
          sentiment === 'bullish' ? "Mountain View Search Leader Monetizes Video Platform Effectively" : "Internet Advertising Monopoly Faces Regulatory Breakup Threats",
          sentiment === 'bullish' ? "Alphabet Subsidiary Advances Quantum Computing Research Breakthrough" : "Search Algorithm Provider Encounters Privacy Lawsuit Challenges",
          sentiment === 'bullish' ? "Digital Information Organizer Expands Healthcare Technology Investments" : "Online Platform Operator Struggles with Content Moderation Costs",
          sentiment === 'bullish' ? "Web Services Innovator Transforms Cloud Storage Market Leadership" : "Technology Conglomerate Experiences Talent Retention Difficulties",
          sentiment === 'bullish' ? "Search Engine Architect Develops Advanced Machine Learning Capabilities" : "Advertising Technology Platform Faces European Regulatory Penalties"
        ],
        'AMZN': [
          sentiment === 'bullish' ? "Seattle E-Commerce Pioneer Dominates Last-Mile Delivery Innovation" : "Online Marketplace Operator Encounters Labor Union Organization Efforts",
          sentiment === 'bullish' ? "Web Services Provider Strengthens Enterprise Database Solutions" : "Retail Distribution Giant Faces Antitrust Investigation Pressure",
          sentiment === 'bullish' ? "Digital Streaming Platform Competes with Traditional Entertainment Media" : "Logistics Network Operator Struggles with Rising Fuel Costs",
          sentiment === 'bullish' ? "Cloud Infrastructure Leader Advances Machine Learning Service Offerings" : "E-Commerce Platform Experiences Third-Party Seller Fraud Issues",
          sentiment === 'bullish' ? "Online Retail Innovator Expands Grocery Delivery Service Footprint" : "Marketplace Technology Provider Confronts Counterfeit Product Problems"
        ],
        'NVDA': [
          sentiment === 'bullish' ? "Santa Clara Chip Designer Accelerates Autonomous Vehicle Computing" : "Graphics Card Manufacturer Encounters Cryptocurrency Mining Volatility",
          sentiment === 'bullish' ? "GPU Technology Pioneer Transforms Scientific Computing Applications" : "Semiconductor Vendor Faces Geopolitical Trade Restriction Challenges",
          sentiment === 'bullish' ? "Parallel Processing Innovator Advances Medical Imaging Technology" : "Hardware Acceleration Provider Struggles with Supply Chain Shortages",
          sentiment === 'bullish' ? "Machine Learning Processor Creator Expands Data Center Market Share" : "Graphics Computing Specialist Experiences Gaming Market Saturation",
          sentiment === 'bullish' ? "AI Chip Architecture Leader Revolutionizes Edge Computing Solutions" : "High-Performance Computing Vendor Confronts Intense Competition Pressure"
        ],
        'TSLA': [
          sentiment === 'bullish' ? "Austin Electric Vehicle Manufacturer Scales Battery Production Capacity" : "Automotive Startup Encounters Quality Control Manufacturing Issues",
          sentiment === 'bullish' ? "Sustainable Mobility Leader Advances Full Self-Driving Technology" : "Electric Car Pioneer Faces Regulatory Safety Investigation Concerns",
          sentiment === 'bullish' ? "Clean Transportation Innovator Expands Supercharger Network Infrastructure" : "Battery Technology Developer Struggles with Raw Material Cost Inflation",
          sentiment === 'bullish' ? "Energy Storage Solutions Provider Transforms Grid-Scale Applications" : "Automotive Disruptor Experiences Production Bottleneck Challenges",
          sentiment === 'bullish' ? "Solar Panel Integration Specialist Optimizes Renewable Energy Systems" : "Electric Vehicle Manufacturer Confronts Traditional Automaker Competition"
        ],
        'META': [
          sentiment === 'bullish' ? "Menlo Park Social Network Monetizes Creator Economy Platform" : "Social Media Conglomerate Faces Teen Mental Health Lawsuit Challenges",
          sentiment === 'bullish' ? "Virtual Reality Headset Manufacturer Advances Immersive Technology" : "Digital Advertising Platform Struggles with Apple Privacy Policy Changes",
          sentiment === 'bullish' ? "Messaging Application Provider Integrates E-Commerce Shopping Features" : "Social Networking Giant Encounters Regulatory Data Protection Penalties",
          sentiment === 'bullish' ? "Metaverse Platform Developer Transforms Remote Work Collaboration" : "Communication Technology Vendor Faces Content Moderation Controversies",
          sentiment === 'bullish' ? "Digital Community Builder Expands Short-Form Video Content Strategy" : "Social Media Operator Experiences User Engagement Decline Issues"
        ],
        'SPY': [
          sentiment === 'bullish' ? "Broad Market ETF Reflects Corporate Dividend Growth Momentum" : "S&P 500 Index Fund Shows Sector Rotation Uncertainty Patterns",
          sentiment === 'bullish' ? "Large-Cap Equity Tracker Benefits from Earnings Season Outperformance" : "Diversified Stock Portfolio Experiences Inflationary Pressure Concerns",
          sentiment === 'bullish' ? "Blue-Chip Index Representative Captures Market Recovery Optimism" : "Broad-Based Equity Fund Faces Interest Rate Sensitivity Challenges",
          sentiment === 'bullish' ? "Market Capitalization Weighted Fund Demonstrates Institutional Confidence" : "Large Company Stock Composite Shows Valuation Concern Signals",
          sentiment === 'bullish' ? "Equity Market Benchmark Reflects Economic Expansion Indicators" : "Stock Market Index Tracker Encounters Geopolitical Risk Factors"
        ],
        'QQQ': [
          sentiment === 'bullish' ? "NASDAQ-100 ETF Captures Innovation Sector Investment Flows" : "Technology-Heavy Index Fund Faces Growth Stock Valuation Concerns",
          sentiment === 'bullish' ? "Growth Stock Composite Benefits from Digital Transformation Trends" : "Tech-Focused Portfolio Experiences Interest Rate Sensitivity Pressure",
          sentiment === 'bullish' ? "Large-Cap Growth Fund Attracts Momentum Investment Strategies" : "Technology Sector Tracker Shows Earnings Multiple Compression",
          sentiment === 'bullish' ? "Innovation-Driven Equity Fund Reflects Venture Capital Confidence" : "Growth-Oriented Index Experiences Regulatory Technology Scrutiny",
          sentiment === 'bullish' ? "High-Growth Company Tracker Demonstrates Market Leadership Rotation" : "Technology Investment Vehicle Faces Profitability Margin Pressure"
        ],
        'DIA': [
          sentiment === 'bullish' ? "Dow Jones Industrial ETF Reflects Manufacturing Sector Resilience" : "Blue-Chip Index Fund Shows Traditional Industry Decline Concerns",
          sentiment === 'bullish' ? "Industrial Average Tracker Benefits from Infrastructure Investment Spending" : "Value Stock Composite Faces Cyclical Economic Headwind Challenges",
          sentiment === 'bullish' ? "Established Company Index Demonstrates Dividend Yield Attractiveness" : "Traditional Industrial Fund Experiences Energy Transition Pressures",
          sentiment === 'bullish' ? "Legacy Corporation Tracker Reflects Economic Reopening Optimism" : "Manufacturing-Heavy Portfolio Shows Supply Chain Disruption Impact",
          sentiment === 'bullish' ? "Blue-Chip Equity Fund Captures Conservative Investment Allocation" : "Industrial Stock Index Encounters Global Trade Policy Uncertainties"
        ]
      };

      const alternatives = alternativeHeadlines[symbol] || [
        sentiment === 'bullish' ? `${symbol} Achieves Strategic Market Position Through Operational Excellence` : `${symbol} Encounters Challenging Market Conditions Requiring Adaptation`
      ];

      finalHeadline = alternatives[attempts - 1] || alternatives[0];
    }

    if (attempts >= maxAttempts) {
      console.warn(`Could not generate unique headline for ${symbol} after ${maxAttempts} attempts`);
    }

    return finalHeadline;
  };

  const handleRefreshNews = async () => {
    setIsFetching(true);
    setFetchingStatus('Fetching news from all sources...');
    
    try {
      const result = await fetchNews();
      await refetch();
      
      if (result.success) {
        toast({
          title: "News Updated",
          description: result.message,
        });
      } else {
        toast({
          title: "Partial Success",
          description: "Some news sources may have failed. Check the results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
      setFetchingStatus('');
    }
  };

  // Helper function to get asset type and styling
  const getAssetInfo = (symbol: string) => {
    if (MAGNIFICENT_7.includes(symbol)) {
      return { type: 'Stock', color: 'bg-blue-500' };
    } else if (MAJOR_INDEX_FUNDS.includes(symbol)) {
      return { type: 'Index', color: 'bg-purple-500' };
    }
    return { type: 'Other', color: 'bg-gray-500' };
  };

  // Helper function to generate AI analysis paragraph for ANY article
  const generateAnalysisParagraph = (item: any) => {
    const sentimentText = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Generate contextual analysis based on sentiment and confidence
    if (sentimentText === 'bullish' && confidence > 70) {
      return `Strong positive indicators suggest ${item.symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidence > 70) {
      return `This news presents concerning factors for ${item.symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidence <= 70) {
      return `Moderate positive signals for ${item.symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidence <= 70) {
      return `Some negative factors identified for ${item.symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${item.symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
    }
  };

  // Generate general article summary for recent headlines
  const generateArticleSummary = (item: any) => {
    const title = item.title || '';
    const description = item.description || '';
    
    if (title.toLowerCase().includes('earnings') || title.toLowerCase().includes('revenue')) {
      return `This earnings-related news discusses financial performance and may impact related companies and their stock valuations in the coming trading sessions.`;
    } else if (title.toLowerCase().includes('merger') || title.toLowerCase().includes('acquisition')) {
      return `This merger and acquisition news could significantly affect the companies involved and potentially influence sector-wide trading patterns.`;
    } else if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')) {
      return `This AI-focused development may have broad implications for technology companies and could influence investor sentiment in the tech sector.`;
    } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('stocks')) {
      return `This market-focused article provides insights into current trading conditions and may influence overall investor sentiment and market direction.`;
    } else if (title.toLowerCase().includes('federal reserve') || title.toLowerCase().includes('interest rates')) {
      return `This monetary policy news could have wide-reaching effects on market liquidity, borrowing costs, and overall economic conditions.`;
    } else {
      return `This article covers significant business and financial developments that may influence market sentiment and investment decisions across various sectors.`;
    }
  };

  // Format publish time to show date and time to the minute
  const formatPublishTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      <MarketTicker />
      
      <main className="pt-36 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Market News</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">LIVE</span>
                <span className="text-gray-600 dark:text-slate-400 text-sm">AI Analyzed</span>
              </div>
            </div>
            <Button 
              onClick={handleRefreshNews}
              disabled={isFetching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Fetching...' : 'Refresh News'}
            </Button>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Latest AI-analyzed news for major stocks and index funds</p>
          
          {isFetching && fetchingStatus && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              {fetchingStatus}
            </div>
          )}
          
          {isPricesLoading && (
            <div className="text-amber-600 dark:text-yellow-400 text-sm mt-2 font-medium">
              Loading asset prices from Finnhub...
            </div>
          )}
          
          {!isPricesLoading && (!stockPrices || stockPrices.length === 0) && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
              ⚠️ Asset prices unavailable - check Finnhub API connection
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-slate-400 py-8">
                  Loading primary assets news...
                </div>
              ) : (
                // Always show boxes, one for each primary asset
                PRIMARY_ASSETS.map((symbol) => {
                  const article = mainAnalysisArticles.find(item => item.symbol === symbol);
                  const stockPrice = getStockPrice(symbol);
                  const assetInfo = getAssetInfo(symbol);
                  
                  console.log(`Stock price for ${symbol}:`, stockPrice); // Debug log

                  if (article) {
                    // Generate composite headline for this stock/fund with uniqueness checking
                    const existingHeadlines = mainAnalysisArticles
                      .filter(item => item.symbol !== symbol)
                      .map(item => generateCompositeHeadline(item, []));
                    
                    const compositeHeadline = generateCompositeHeadline(article, existingHeadlines);
                    
                    return (
                      <NewsCard 
                        key={article.id} 
                        symbol={article.symbol}
                        title={compositeHeadline}
                        description={article.description}
                        confidence={article.ai_confidence}
                        sentiment={article.ai_sentiment}
                        category={article.category}
                        isHistorical={article.ai_reasoning?.includes('Historical')}
                        sourceLinks={article.source_links || '[]'}
                        stockPrice={stockPrice}
                      />
                    );
                  } else {
                    // Show placeholder for assets without current analysis
                    return (
                      <div key={symbol} className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${assetInfo.color} text-white`}>{symbol}</Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                              {assetInfo.type}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                              NO RECENT NEWS
                            </Badge>
                          </div>
                          {stockPrice && (
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-600 rounded-lg px-3 py-2">
                              <div className="text-right">
                                <div className="text-gray-900 dark:text-white font-semibold">${stockPrice.price.toFixed(2)}</div>
                                <div className={`text-xs flex items-center gap-1 ${
                                  stockPrice.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {stockPrice.change >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)} ({stockPrice.changePercent.toFixed(2)}%)
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
                          No recent analysis available for {symbol}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-sm">
                          Click "Refresh News" to fetch the latest market updates and AI analysis.
                        </p>
                        {!stockPrice && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                            Asset price unavailable - check Finnhub connection
                          </p>
                        )}
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Headlines</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {allRecentHeadlines && allRecentHeadlines.length > 0 ? (
                    allRecentHeadlines.slice(0, 30).map((item, index) => (
                      <div key={`headline-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
                        >
                          {item.title}
                        </a>
                        <div className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                          {formatPublishTime(item.published_at)}
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                          <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                            <span className="text-cyan-400 font-medium">Summary:</span> {generateArticleSummary(item)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-600 dark:text-slate-400 py-4">
                      <p>No headlines available.</p>
                      <p className="text-sm mt-2">Click "Refresh News" to load articles.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
