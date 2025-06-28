
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
    <nav className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <Link to="/" className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
          LIVE
        </Badge>
      </Link>
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
    </nav>
  );
};

export default DashboardNav;
