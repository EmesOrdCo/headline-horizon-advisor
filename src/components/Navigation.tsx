
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">MarketSensorAI</div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
            BETA
          </Badge>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium">How it Works</a>
          
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

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
              <Link to="/auth">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-slate-300"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-gray-700 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-slate-900">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">MarketSensorAI</div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                    BETA
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="text-gray-700 dark:text-slate-300"
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex flex-col flex-1 p-6 space-y-6">
                <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-4">
                  <a 
                    href="#features" 
                    className="block text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#how-it-works" 
                    className="block text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How it Works
                  </a>
                </div>
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-slate-800">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
