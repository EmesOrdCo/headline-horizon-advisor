
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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">StockPredict AI</div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                BETA
              </Badge>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"} 
                className={isActive("/dashboard") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/predictions">
              <Button 
                variant={isActive("/predictions") ? "default" : "ghost"} 
                className={isActive("/predictions") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Predictions
              </Button>
            </Link>
            <Link to="/biggest-movers">
              <Button 
                variant={isActive("/biggest-movers") ? "default" : "ghost"} 
                className={isActive("/biggest-movers") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <Activity className="w-4 h-4 mr-2" />
                Biggest Movers
              </Button>
            </Link>
            <Link to="/magnificent-7">
              <Button 
                variant={isActive("/magnificent-7") ? "default" : "ghost"} 
                className={isActive("/magnificent-7") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <Star className="w-4 h-4 mr-2" />
                Magnificent 7
              </Button>
            </Link>
            <Link to="/index-funds">
              <Button 
                variant={isActive("/index-funds") ? "default" : "ghost"} 
                className={isActive("/index-funds") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Index Funds
              </Button>
            </Link>
            <Link to="/my-stocks">
              <Button 
                variant={isActive("/my-stocks") ? "default" : "ghost"} 
                className={isActive("/my-stocks") ? "bg-emerald-600 hover:bg-emerald-700" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}
              >
                <User className="w-4 h-4 mr-2" />
                My Stocks
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300 text-sm hidden md:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
