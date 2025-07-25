import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, ExternalLink, Flame } from "lucide-react";
import { ConfidenceDots } from "@/components/NewsCard/ConfidenceDots";

interface AIAnalysisCardProps {
  symbol: string;
  stockInfo: {
    price: number;
    change: number;
    changePercent: number;
  };
}

const AIAnalysisCard = ({ symbol, stockInfo }: AIAnalysisCardProps) => {
  // Generate dummy content based on the symbol
  const getAnalysisContent = (symbol: string) => {
    const templates = [
      {
        title: `${symbol}: Mixed signals in current market`,
        description: `Historical market analysis for ${symbol} based on recent trends and market patterns.`,
        sentiment: "Neutral",
        confidence: 3,
        detailedAnalysis: `Mixed signals for ${symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment. The stock has been trading within a consolidation pattern over the past several weeks, indicating market indecision about the company's near-term direction. Technical indicators are providing mixed signals, with the RSI showing neutral momentum while moving averages suggest a sideways trend. From a fundamental perspective, recent earnings reports have been in line with expectations, neither significantly beating nor missing analyst forecasts. The broader market environment remains supportive for technology stocks, though sector rotation patterns suggest investors are becoming more selective. Risk factors include potential regulatory headwinds and competitive pressures, while upside catalysts include new product launches and expanding market opportunities. Overall, the risk-reward profile appears balanced at current levels, making this an appropriate holding for diversified portfolios but not necessarily a strong conviction buy or sell.`,
        tldr: `Based on recent market patterns and technical indicators, ${symbol} is showing mixed signals with neutral sentiment. The stock appears to be consolidating in a tight range, suggesting potential for either direction based on broader market catalysts. Current analysis indicates a balanced risk-reward profile with moderate confidence in near-term stability.`
      },
      {
        title: `${symbol}: Strong fundamentals support bullish outlook`,
        description: `Comprehensive analysis of ${symbol} based on financial metrics and market positioning.`,
        sentiment: "Bullish",
        confidence: 4,
        detailedAnalysis: `Strong fundamentals and positive market sentiment indicate bullish outlook for ${symbol}. Technical indicators support continued upward momentum. The company has demonstrated consistent revenue growth over the past four quarters, with expanding profit margins that reflect operational efficiency improvements. Recent strategic partnerships and product innovations position the company well for continued market share gains in its core segments. Technical analysis reveals a strong uptrend with key support levels holding firm, while momentum indicators suggest the stock has room for further appreciation. The broader sector tailwinds, including increased digitalization trends and favorable regulatory environment, provide additional support for the bullish thesis. Management's forward guidance has been consistently conservative and achievable, building investor confidence in execution capabilities. While valuation metrics have expanded, they remain reasonable relative to growth prospects and peer comparisons. Key risks include potential market volatility and execution challenges, but the overall fundamental picture supports a constructive outlook for the next 6-12 months.`,
        tldr: `${symbol} demonstrates strong fundamental metrics and positive market momentum, indicating a bullish outlook in the near term. Recent earnings performance and sector leadership position the stock well for continued growth. Technical analysis confirms bullish sentiment with high confidence levels across multiple indicators.`
      }
    ];
    
    return templates[symbol.length % 2];
  };

  // Dummy news insights data
  const newsInsights = [
    {
      id: '1',
      headline: `${symbol} Reports Record Q4 Revenue Growth of 18% Year-Over-Year`,
      source: 'Reuters',
      timestamp: '2h ago',
      tldr: `${symbol} exceeded analyst expectations with strong quarterly performance driven by increased market demand and operational efficiency improvements.`,
      sentiment: 'Bullish' as const,
      impactScore: 4,
      whyMatters: 'Revenue growth signals strong fundamental business health.',
      articleUrl: '#'
    },
    {
      id: '2',
      headline: `Industry Analysts Raise Price Target for ${symbol} Following Strategic Partnership`,
      source: 'Bloomberg',
      timestamp: '4h ago',
      tldr: 'Multiple Wall Street firms upgraded their price targets following announcement of a major partnership that could expand market reach significantly.',
      sentiment: 'Bullish' as const,
      impactScore: 3,
      whyMatters: 'Strategic partnerships often lead to accelerated growth and market expansion.',
      articleUrl: '#'
    },
    {
      id: '3',
      headline: `Market Volatility Creates Uncertainty for ${symbol} Near-Term Outlook`,
      source: 'Financial Times',
      timestamp: '6h ago',
      tldr: 'Broader market concerns about economic indicators have created headwinds for growth stocks, including those in the sector.',
      sentiment: 'Neutral' as const,
      impactScore: 2,
      whyMatters: 'Market sentiment can impact short-term price movements regardless of fundamentals.',
      articleUrl: '#'
    },
    {
      id: '4',
      headline: `Regulatory Concerns Emerge Around ${symbol}'s Data Privacy Practices`,
      source: 'Wall Street Journal',
      timestamp: '8h ago',
      tldr: 'Potential regulatory scrutiny could impact operations and require additional compliance investments in the coming quarters.',
      sentiment: 'Bearish' as const,
      impactScore: 3,
      whyMatters: 'Regulatory challenges can create operational costs and market uncertainty.',
      articleUrl: '#'
    },
    {
      id: '5',
      headline: `${symbol} Announces New AI Initiative to Enhance Customer Experience`,
      source: 'TechCrunch',
      timestamp: '12h ago',
      tldr: 'Company unveiled comprehensive AI strategy aimed at improving customer satisfaction and operational efficiency through machine learning.',
      sentiment: 'Bullish' as const,
      impactScore: 3,
      whyMatters: 'AI investments often drive long-term competitive advantages and efficiency gains.',
      articleUrl: '#'
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'Bearish':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'Neutral':
        return 'bg-slate-600 text-white hover:bg-slate-700';
      default:
        return 'bg-slate-600 text-white hover:bg-slate-700';
    }
  };

  const renderImpactScore = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Flame
            key={i}
            className={`w-3 h-3 ${
              i < score ? 'text-orange-500' : 'text-slate-600'
            }`}
            fill={i < score ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  const analysis = getAnalysisContent(symbol);
  const isPositive = stockInfo.change >= 0;

  const getSentimentColorSimple = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'bg-green-600 text-white';
      case 'Bearish':
        return 'bg-red-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getSentimentSliderPosition = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'justify-end';
      case 'Bearish':
        return 'justify-start';
      default:
        return 'justify-center';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-medium">
            {symbol}
          </Badge>
          <span className="text-slate-400 text-sm">Stock</span>
          <Badge className="bg-amber-600 text-white px-2 py-1 text-xs">
            HISTORICAL*
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-white text-xl font-bold">
            ${stockInfo.price.toFixed(2)}
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stockInfo.change.toFixed(2)} ({isPositive ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Main Analysis Title */}
      <div>
        <h2 className="text-white text-xl font-semibold mb-2">
          {analysis.title}
        </h2>
        <p className="text-slate-400 text-sm">
          {analysis.description}
        </p>
      </div>

      {/* AI TLDR Section */}
      <Card className="bg-slate-800/50 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold text-sm">AI TLDR</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {analysis.tldr}
          </p>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">AI Analysis</span>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            *Based on historical market analysis and trends for {symbol}.
          </p>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-slate-400 text-sm">Confidence Level</span>
              <ConfidenceDots confidence={analysis.confidence} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-4">Market Sentiment</h3>
          
          {/* Sentiment Labels */}
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
          
          {/* Sentiment Slider */}
          <div className="relative mb-4">
            <div className="w-full h-2 bg-slate-700 rounded-full"></div>
            <div className={`flex ${getSentimentSliderPosition(analysis.sentiment)} mb-2`}>
              <div className="w-4 h-4 bg-white rounded-full -mt-1 border-2 border-slate-600"></div>
            </div>
            <div className="text-center">
              <span className="text-white font-medium">{analysis.sentiment}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${getSentimentColorSimple(analysis.sentiment)} px-3 py-1`}>
              {analysis.sentiment.toUpperCase()}
            </Badge>
            <span className="text-slate-400 text-sm">Technology Stock</span>
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered News Insights */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-xl">AI-Powered News Insights</CardTitle>
          <p className="text-slate-400 text-sm">
            Real-time analysis of news sentiment and market impact for {symbol}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {newsInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Header with source and timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="font-medium">{insight.source}</span>
                      <span>·</span>
                      <span>{insight.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderImpactScore(insight.impactScore)}
                      <Badge className={getSentimentColor(insight.sentiment)}>
                        {insight.sentiment}
                      </Badge>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-white font-semibold text-base mb-3 leading-tight">
                    {insight.headline}
                  </h3>

                  {/* AI TLDR */}
                  <div className="mb-3">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      <span className="text-cyan-400 font-medium">AI Summary:</span> {insight.tldr}
                    </p>
                  </div>

                  {/* Why this matters */}
                  {insight.whyMatters && (
                    <div className="mb-3">
                      <p className="text-slate-300 text-sm">
                        <span className="text-amber-400 font-medium">Why this matters:</span> {insight.whyMatters}
                      </p>
                    </div>
                  )}

                  {/* View Full Article */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50 text-xs"
                      onClick={() => window.open(insight.articleUrl, '_blank')}
                    >
                      <span>View Full Article</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-cyan-400 font-semibold text-lg mb-4">In-Depth Analysis</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {analysis.detailedAnalysis}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisCard;