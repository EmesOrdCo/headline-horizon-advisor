
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface AIAnalysisTabProps {
  symbol: string;
  stockInfo: {
    price: number;
  };
}

const AIAnalysisTab = ({ symbol, stockInfo }: AIAnalysisTabProps) => {
  return (
    <div className="space-y-6">
      {/* TLDR Section - Only on AI Analysis Tab */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            TLDR - Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">📈 Sentiment</h4>
              <p className="text-slate-300 text-sm">
                Strong bullish sentiment with 75% positive news coverage. Technical indicators support upward momentum.
              </p>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">🎯 Target</h4>
              <p className="text-slate-300 text-sm">
                AI forecast suggests 12% upside potential with 82% confidence. Price target set at ${(stockInfo.price * 1.12).toFixed(2)}.
              </p>
            </div>
            <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">⚠️ Risk</h4>
              <p className="text-slate-300 text-sm">
                Moderate risk with diversified revenue. Main concern is market volatility, but fundamentals remain solid.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">AI Qualitative Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">Market Sentiment</h4>
              <p className="text-slate-300 text-sm">
                Based on recent market movements and news analysis, {symbol} shows strong bullish sentiment. 
                Technical indicators suggest continued upward momentum with solid support levels.
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">Growth Outlook</h4>
              <p className="text-slate-300 text-sm">
                The company demonstrates robust growth potential in key sectors. Recent product launches 
                and strategic partnerships position it well for sustained expansion.
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">Risk Assessment</h4>
              <p className="text-slate-300 text-sm">
                Moderate risk profile with well-diversified revenue streams. Market volatility remains 
                the primary concern, though fundamentals remain strong.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* News Source Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">News Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-slate-300">Reuters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-xs">Bullish</Badge>
                  <span className="text-slate-400 text-sm">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Bloomberg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-600 text-white text-xs">Neutral</Badge>
                  <span className="text-slate-400 text-sm">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">MarketWatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-xs">Bullish</Badge>
                  <span className="text-slate-400 text-sm">78%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-slate-300">CNBC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600 text-white text-xs">Bearish</Badge>
                  <span className="text-slate-400 text-sm">65%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-2">Overall Sentiment</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-emerald-400 font-semibold">75% Bullish</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAnalysisTab;
