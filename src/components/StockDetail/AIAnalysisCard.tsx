import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Clock, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalysisCardProps {
  symbol: string;
  stockInfo: {
    price: number;
    change: number;
    changePercent: number;
  };
}

const AIAnalysisCard = ({ symbol, stockInfo }: AIAnalysisCardProps) => {
  const dummyAnalysis = {
    tldr: `Based on recent earnings and market trends, ${symbol} shows strong upward momentum with institutional backing. Technical indicators suggest continued growth potential through Q2, driven by expanding market share and improved operational efficiency. However, broader market volatility and sector rotation risks could limit short-term gains.`,
    sentiment: 'Bullish',
    confidence: 78,
    articles: [
      {
        headline: `${symbol} Beats Q4 Earnings Expectations Amid Strong Revenue Growth`,
        source: 'Bloomberg',
        timestamp: '2h ago',
        tldr: 'Company reported 15% revenue growth and raised full-year guidance above analyst expectations.',
        sentiment: 'Bullish',
        impact: 4,
        whyMatters: 'Demonstrates strong execution and market positioning for continued growth.'
      },
      {
        headline: `Institutional Investors Increase ${symbol} Holdings by 23% This Quarter`,
        source: 'Reuters',
        timestamp: '4h ago',
        tldr: 'Major pension funds and hedge funds have significantly increased their positions based on fundamental strength.',
        sentiment: 'Bullish',
        impact: 3,
        whyMatters: 'Institutional confidence signals long-term value potential.'
      },
      {
        headline: 'Market Volatility Concerns Impact Tech Sector Outlook',
        source: 'Financial Times',
        timestamp: '6h ago',
        tldr: 'Rising interest rate fears and geopolitical tensions are causing sector-wide valuation pressure.',
        sentiment: 'Bearish',
        impact: 2,
        whyMatters: 'Broader market headwinds could offset individual stock performance.'
      },
      {
        headline: `${symbol} Partners with Major Cloud Provider for Digital Transformation`,
        source: 'TechCrunch',
        timestamp: '1d ago',
        tldr: 'Strategic partnership expected to accelerate digital initiatives and reduce operational costs.',
        sentiment: 'Neutral',
        impact: 3,
        whyMatters: 'Long-term efficiency gains but immediate impact unclear.'
      }
    ]
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return 'bg-green-500';
      case 'Bearish': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactIcons = (impact: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < impact ? 'text-orange-400' : 'text-slate-600'}>🔥</span>
    ));
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis TLDR */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-lg text-white">AI Market Analysis</CardTitle>
            <Badge className={`${getSentimentColor(dummyAnalysis.sentiment)} text-white text-xs`}>
              {dummyAnalysis.sentiment}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {dummyAnalysis.tldr}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Confidence Level</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      dot <= Math.ceil(dummyAnalysis.confidence / 20) ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-blue-400 text-sm font-semibold">{dummyAnalysis.confidence}%</span>
            </div>
            <div className="text-slate-400 text-sm">
              Last updated: 5min ago
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Articles Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-lg text-white">AI-Powered News Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {dummyAnalysis.articles.map((article, index) => (
            <div key={index} className="border border-slate-600/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-white font-medium text-sm leading-tight flex-1">
                  {article.headline}
                </h3>
                <Badge className={`${getSentimentColor(article.sentiment)} text-white text-xs shrink-0`}>
                  {article.sentiment}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{article.source}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{article.timestamp}</span>
                <span className="ml-auto flex items-center gap-1">
                  {getImpactIcons(article.impact)}
                </span>
              </div>
              
              <p className="text-slate-300 text-sm">
                {article.tldr}
              </p>
              
              <div className="text-slate-400 text-xs italic">
                <strong>Why this matters:</strong> {article.whyMatters}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-400 hover:text-blue-300 text-xs p-0 h-auto"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Full Article
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisCard;