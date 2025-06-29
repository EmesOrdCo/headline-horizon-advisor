
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-nav border-b border-theme-nav">
        <div className="w-[95%] mx-auto flex items-center justify-between px-6 py-3">
          {/* Left Side - Logo and Navigation Menu */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="text-xl font-bold text-theme-accent">StockPredict AI</div>
              <Badge className="bg-theme-accent text-theme-inverse text-xs">LIVE</Badge>
            </Link>
            
            {/* Navigation Menu */}
            <div className="flex items-center gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-theme-nav hover:text-theme-primary transition-colors font-medium">
                  Live Market News <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-theme-surface border-theme-card">
                  <DropdownMenuItem className="text-theme-secondary hover:text-theme-primary hover:bg-theme-muted">
                    <Link to="/dashboard">Magnificent 7</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-theme-secondary hover:text-theme-primary hover:bg-theme-muted">
                    <Link to="/dashboard">Funds</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-theme-secondary hover:text-theme-primary hover:bg-theme-muted">
                    <Link to="/dashboard">Crypto</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/my-stocks" className="text-theme-nav hover:text-theme-primary transition-colors font-medium">
                My Stocks
              </Link>
              
              <Link to="/biggest-movers" className="text-theme-nav hover:text-theme-primary transition-colors font-medium">
                Biggest Movers
              </Link>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <span className="text-theme-muted text-sm font-medium">{formatTime(currentTime)}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="border-theme-card text-theme-secondary hover:bg-theme-muted bg-theme-surface"
            >
              Sign Out
            </Button>
            <div className="flex items-center gap-2 bg-theme-muted rounded-full p-1">
              <Sun className="h-4 w-4 text-theme-muted" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-white"
              />
              <Moon className="h-4 w-4 text-theme-muted" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;
