import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Moon } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-emerald-400">
            MarketSensorAI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-emerald-400 transition-colors">
              How it Works
            </a>
            
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Moon size={20} />
            </button>

            {user ? (
              <Link to="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Early Access
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-8">
              MarketSensorAI
            </div>
            
            <a 
              href="#features" 
              className="text-xl text-muted-foreground hover:text-emerald-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-xl text-muted-foreground hover:text-emerald-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it Works
            </a>
            
            {user ? (
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.href = '/dashboard';
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-3"
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.href = '/auth';
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-3"
              >
                Get Early Access
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;