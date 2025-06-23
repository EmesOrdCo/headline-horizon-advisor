
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const DashboardNav = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString('en-GB');
  };

  return (
    <nav className="flex items-center justify-between p-6 border-b border-slate-800">
      <Link to="/" className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          LIVE
        </Badge>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">{formatTime(currentTime)}</span>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default DashboardNav;
