
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
          BETA
        </Badge>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium">Features</a>
        <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium">How it Works</a>
        <a href="#pricing" className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium">Pricing</a>
        {user ? (
          <Link to="/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Dashboard
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                Log In
              </Button>
            </Link>
            <Link to="/onboarding/email">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
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

export default Navigation;
