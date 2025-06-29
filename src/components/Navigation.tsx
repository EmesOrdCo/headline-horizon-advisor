
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
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto bg-theme-nav/80 backdrop-blur-sm border-b border-theme-nav">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-theme-accent">StockPredict AI</div>
        <Badge variant="secondary" className="bg-theme-accent/20 text-theme-accent border-theme-accent/30">
          BETA
        </Badge>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-theme-nav hover:text-theme-primary transition-colors font-medium">Features</a>
        <a href="#how-it-works" className="text-theme-nav hover:text-theme-primary transition-colors font-medium">How it Works</a>
        <a href="#pricing" className="text-theme-nav hover:text-theme-primary transition-colors font-medium">Pricing</a>
        {user ? (
          <Link to="/dashboard">
            <Button className="bg-theme-accent hover:bg-theme-accent/90 text-theme-inverse">
              Dashboard
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" className="border-theme-accent/30 text-theme-accent hover:bg-theme-accent/10">
                Log In
              </Button>
            </Link>
            <Link to="/onboarding/email">
              <Button className="bg-theme-accent hover:bg-theme-accent/90 text-theme-inverse">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
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
    </nav>
  );
};

export default Navigation;
