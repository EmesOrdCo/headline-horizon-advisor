
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
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">StockPredict AI</div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
              LIVE
            </Badge>
          </Link>
          
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Markets <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/predictions">Predictions</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Analysis <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>AI Predictions</DropdownMenuItem>
                <DropdownMenuItem>Market Trends</DropdownMenuItem>
                <DropdownMenuItem>Technical Analysis</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Technology <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>AI Models</DropdownMenuItem>
                <DropdownMenuItem>Data Sources</DropdownMenuItem>
                <DropdownMenuItem>API Access</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investigations</a>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                More <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Help Center</DropdownMenuItem>
                <DropdownMenuItem>About</DropdownMenuItem>
                <DropdownMenuItem>Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">{formatTime(currentTime)}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
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
