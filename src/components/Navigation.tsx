
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          BETA
        </Badge>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="dark:text-slate-300 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="dark:text-slate-300 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">How it Works</a>
        <a href="#pricing" className="dark:text-slate-300 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
        <Link to="/auth">
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            Sign In
          </Button>
        </Link>
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

export default Navigation;
