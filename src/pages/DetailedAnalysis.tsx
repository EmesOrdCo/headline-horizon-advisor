
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowLeft, Clock, FileText, Brain } from "lucide-react";
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

  const articleAnalyses = [
    {
      title: "Apple announces record quarterly earnings, beats estimates by 15%",
      impact: "Bullish",
      weight: 85,
      timeAgo: "2h ago",
      analysis: "This earnings beat is particularly significant as it demonstrates Apple's resilience in a challenging economic environment. The 15% beat indicates strong execution across multiple product lines, especially services revenue which has higher margins. Historically, earnings beats of this magnitude lead to 3-7% stock price appreciation within 48 hours. The strong performance suggests the company's pricing power remains intact despite inflation concerns, and the diversified revenue streams provide stability. Institutional investors typically view such beats as validation of management's guidance and often increase position sizes following these announcements."
    },
    {
      title: "Apple introduces new AI features in latest iOS update",
      impact: "Bullish",
      weight: 65,
      timeAgo: "4h ago",
      analysis: "The integration of advanced AI capabilities positions Apple competitively in the rapidly evolving AI landscape. This move addresses investor concerns about Apple falling behind in AI innovation compared to competitors like Google and Microsoft. The iOS integration suggests a comprehensive AI strategy that could drive upgrade cycles and increase ecosystem stickiness. Market analysts view AI integration as a key growth driver for the next 2-3 years, particularly as it enables new services and potentially justifies premium pricing. The timing aligns with increased enterprise adoption of AI tools, opening new B2B revenue opportunities."
    },
    {
      title: "Tech sector faces regulatory scrutiny in Europe",
      impact: "Bearish",
      weight: 30,
      timeAgo: "6h ago",
      analysis: "European regulatory pressure on tech companies creates uncertainty around future compliance costs and potential revenue restrictions. For Apple specifically, this could impact App Store commission structures and require significant changes to business models in EU markets. While the immediate financial impact may be limited (EU represents ~25% of revenue), the precedent-setting nature of these regulations could influence other markets. However, Apple's strong balance sheet and legal resources position it well to navigate regulatory challenges. The market typically overreacts to regulatory news initially, often creating buying opportunities for long-term investors."
    },
    {
      title: "Supply chain disruptions affect manufacturing",
      impact: "Bearish",
      weight: 25,
      timeAgo: "8h ago",
      analysis: "Supply chain concerns have been a recurring theme for Apple, but the company has historically demonstrated exceptional supply chain management. While disruptions can impact short-term production schedules, Apple's diversified supplier base and long-term contracts provide resilience. The company's significant cash position allows for strategic inventory management and supplier relationship investments during challenging periods. Recent supply chain investments in India and other regions reduce China dependency, which markets view favorably. Any temporary production delays often result in pent-up demand rather than lost sales, given Apple's product differentiation and customer loyalty."
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

          {/* In-Depth Article Analysis */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">In-Depth Article Analysis</h2>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 pr-4">
                {articleAnalyses.map((article, index) => {
                  const isPositive = article.impact === 'Bullish';
                  return (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-sm leading-tight flex-1 mr-3">{article.title}</h3>
                        <Badge className={`${isPositive ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs`}>
                          {article.impact.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-slate-400">Impact Weight</span>
                          <ConfidenceDots confidence={article.weight} />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-slate-400 text-xs">{article.timeAgo}</span>
                      </div>
                      
                      <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-400 font-medium text-xs">AI Impact Analysis</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {article.analysis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedAnalysis;
