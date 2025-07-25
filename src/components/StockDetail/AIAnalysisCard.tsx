import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
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
        detailedAnalysis: `Mixed signals for ${symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`,
        tldr: `Based on recent market patterns and technical indicators, ${symbol} is showing mixed signals with neutral sentiment. The stock appears to be consolidating in a tight range, suggesting potential for either direction based on broader market catalysts. Current analysis indicates a balanced risk-reward profile with moderate confidence in near-term stability.`
      },
      {
        title: `${symbol}: Strong fundamentals support bullish outlook`,
        description: `Comprehensive analysis of ${symbol} based on financial metrics and market positioning.`,
        sentiment: "Bullish",
        confidence: 4,
        detailedAnalysis: `Strong fundamentals and positive market sentiment indicate bullish outlook for ${symbol}. Technical indicators support continued upward momentum.`,
        tldr: `${symbol} demonstrates strong fundamental metrics and positive market momentum, indicating a bullish outlook in the near term. Recent earnings performance and sector leadership position the stock well for continued growth. Technical analysis confirms bullish sentiment with high confidence levels across multiple indicators.`
      }
    ];
    
    return templates[symbol.length % 2];
  };

  const analysis = getAnalysisContent(symbol);
  const isPositive = stockInfo.change >= 0;

  const getSentimentColor = (sentiment: string) => {
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
            <Badge className={`${getSentimentColor(analysis.sentiment)} px-3 py-1`}>
              {analysis.sentiment.toUpperCase()}
            </Badge>
            <span className="text-slate-400 text-sm">Technology Stock</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-cyan-400 font-semibold mb-3">Detailed Analysis:</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {analysis.detailedAnalysis}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisCard;