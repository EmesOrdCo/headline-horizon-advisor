
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, TrendingUp, BarChart3, Activity, Star, PieChart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DashboardNav = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                BETA
              </Badge>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/dashboard") ? "bg-slate-700" : ""}`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/predictions">
              <Button 
                variant={isActive("/predictions") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/predictions") ? "bg-slate-700" : ""}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Predictions
              </Button>
            </Link>
            <Link to="/biggest-movers">
              <Button 
                variant={isActive("/biggest-movers") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/biggest-movers") ? "bg-slate-700" : ""}`}
              >
                <Activity className="w-4 h-4 mr-2" />
                Biggest Movers
              </Button>
            </Link>
            <Link to="/magnificent-7">
              <Button 
                variant={isActive("/magnificent-7") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/magnificent-7") ? "bg-slate-700" : ""}`}
              >
                <Star className="w-4 h-4 mr-2" />
                Magnificent 7
              </Button>
            </Link>
            <Link to="/index-funds">
              <Button 
                variant={isActive("/index-funds") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/index-funds") ? "bg-slate-700" : ""}`}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Index Funds
              </Button>
            </Link>
            <Link to="/my-stocks">
              <Button 
                variant={isActive("/my-stocks") ? "secondary" : "ghost"} 
                className={`text-slate-300 hover:text-white ${isActive("/my-stocks") ? "bg-slate-700" : ""}`}
              >
                <User className="w-4 h-4 mr-2" />
                My Stocks
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm hidden md:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
