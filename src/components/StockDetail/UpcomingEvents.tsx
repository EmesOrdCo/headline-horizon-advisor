
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const UpcomingEvents = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Calendar className="w-4 h-4" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-emerald-400 font-semibold text-sm">Earnings Report</div>
            <div className="text-slate-400 text-xs">Q2 2025</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">27</div>
            <div className="text-slate-400 text-xs">AUG</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-blue-400 font-semibold text-sm">Dividend Payment</div>
            <div className="text-slate-400 text-xs">$0.28 per share</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">15</div>
            <div className="text-slate-400 text-xs">SEP</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-purple-400 font-semibold text-sm">Analyst Day</div>
            <div className="text-slate-400 text-xs">Investor meeting</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">03</div>
            <div className="text-slate-400 text-xs">OCT</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
