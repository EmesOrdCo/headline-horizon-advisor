import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsInsight {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  tldr: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impactScore: number;
  whyMatters?: string;
  articleUrl: string;
}

interface AINewsInsightsProps {
  symbol: string;
}

const AINewsInsights = ({ symbol }: AINewsInsightsProps) => {
  // Dummy content for demonstration
  const newsInsights: NewsInsight[] = [
    {
      id: '1',
      headline: `${symbol} Reports Record Q4 Revenue Growth of 18% Year-Over-Year`,
      source: 'Reuters',
      timestamp: '2h ago',
      tldr: `${symbol} exceeded analyst expectations with strong quarterly performance driven by increased market demand and operational efficiency improvements.`,
      sentiment: 'Bullish',
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
      sentiment: 'Bullish',
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
      sentiment: 'Neutral',
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
      sentiment: 'Bearish',
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
      sentiment: 'Bullish',
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

  return (
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
  );
};

export default AINewsInsights;