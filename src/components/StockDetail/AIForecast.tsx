
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface AIForecastProps {
  stockPrice: number;
}

const AIForecast = ({ stockPrice }: AIForecastProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5" />
          AI Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
          <div className="text-emerald-400 font-bold text-2xl">BULLISH</div>
          <div className="text-slate-300 text-sm mt-1">Next 30 days</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Confidence Level</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                ))}
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
              <span className="text-white font-semibold">82%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Price Target</span>
            <span className="text-emerald-400 font-semibold">${(stockPrice * 1.12).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Upside Potential</span>
            <span className="text-emerald-400 font-semibold">+12%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIForecast;
