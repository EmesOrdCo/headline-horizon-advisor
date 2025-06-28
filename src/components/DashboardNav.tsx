
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

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
    <nav className="flex items-center justify-between p-6 border-b dark:border-slate-800 border-slate-200">
      <Link to="/" className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          LIVE
        </Badge>
      </Link>
      <div className="flex items-center gap-4">
        <span className="dark:text-slate-400 text-slate-600 text-sm">{formatTime(currentTime)}</span>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="dark:border-slate-700 border-slate-300 dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800 hover:bg-slate-100"
        >
          Sign Out
        </Button>
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-slate-300"
          />
          <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
