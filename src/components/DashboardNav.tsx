
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, ChevronDown, Home } from "lucide-react";
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
      {/* Top Navigation Bar - Dark Theme */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="w-[95%] mx-auto flex items-center justify-between px-6 py-3">
          {/* Left Side - Logo and Navigation Menu */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="text-xl font-bold text-emerald-400">StockPredict AI</div>
              <Badge className="bg-emerald-500 text-white text-xs">LIVE</Badge>
            </Link>
            
            {/* Navigation Menu */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium">
                <Home className="w-4 h-4" />
                Home
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium">
                  Live Market News <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Link to="/magnificent-7">Magnificent 7</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Link to="/index-funds">Funds</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/my-stocks" className="text-slate-300 hover:text-white transition-colors font-medium">
                My Stocks
              </Link>
              
              <Link to="/biggest-movers" className="text-slate-300 hover:text-white transition-colors font-medium">
                Biggest Movers
              </Link>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-medium">{formatTime(currentTime)}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-slate-800"
            >
              Sign Out
            </Button>
            <div className="flex items-center gap-2 bg-slate-800 rounded-full p-1">
              <Sun className="h-4 w-4 text-slate-400" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-white"
              />
              <Moon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;
