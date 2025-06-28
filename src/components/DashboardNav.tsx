
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardNav = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString('en-GB');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Top Navigation Bar - Reuters Style */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left Side - Logo and Navigation Menu */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">StockPredict AI</div>
            </Link>
            
            {/* Navigation Menu */}
            <div className="flex items-center gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                  Live Market News <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link to="/dashboard">Magnificent 7</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/dashboard">Funds</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/dashboard">Crypto</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/my-stocks" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                My Stocks
              </Link>
              
              <Link to="/biggest-movers" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Biggest Movers
              </Link>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">{formatTime(currentTime)}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign Out
            </Button>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-full p-1">
              <Sun className="h-4 w-4 text-gray-600 dark:text-slate-400" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-white"
              />
              <Moon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;
