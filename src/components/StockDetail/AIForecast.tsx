
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface AIForecastProps {
  stockPrice: number;
}

const AIForecast = ({ stockPrice }: AIForecastProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Bot className="w-4 h-4" />
          AI Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
          <div className="text-emerald-400 font-bold text-xl">BULLISH</div>
          <div className="text-slate-300 text-xs mt-1">Next 30 days</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Confidence Level</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                ))}
                <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
              </div>
              <span className="text-white font-semibold text-sm">82%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Price Target</span>
            <span className="text-emerald-400 font-semibold text-sm">${(stockPrice * 1.12).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Upside Potential</span>
            <span className="text-emerald-400 font-semibold text-sm">+12%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIForecast;
