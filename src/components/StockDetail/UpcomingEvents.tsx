
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const UpcomingEvents = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-emerald-400 font-semibold">Earnings Report</div>
            <div className="text-slate-400 text-sm">Q2 2025</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">27</div>
            <div className="text-slate-400 text-xs">AUG</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-blue-400 font-semibold">Dividend Payment</div>
            <div className="text-slate-400 text-sm">$0.28 per share</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">15</div>
            <div className="text-slate-400 text-xs">SEP</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-purple-400 font-semibold">Analyst Day</div>
            <div className="text-slate-400 text-sm">Investor meeting</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">03</div>
            <div className="text-slate-400 text-xs">OCT</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
