import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const DashboardNav = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const NavigationLinks = () => (
    <>
      <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors font-medium">
        Dashboard
      </Link>
      
      <Link to="/home1" className="text-slate-300 hover:text-white transition-colors font-medium">
        Home1
      </Link>
      
      <Link to="/home-option1" className="text-slate-300 hover:text-white transition-colors font-medium">
        Home Option 1
      </Link>
      
      <Link to="/home-option2" className="text-slate-300 hover:text-white transition-colors font-medium">
        Home Option 2
      </Link>
      
      <Link to="/home-option3" className="text-slate-300 hover:text-white transition-colors font-medium">
        Home Option 3
      </Link>
      
      <Link to="/my-stocks" className="text-slate-300 hover:text-white transition-colors font-medium">
        My Stocks
      </Link>
      
      <Link to="/biggest-movers" className="text-slate-300 hover:text-white transition-colors font-medium">
        Biggest Movers
      </Link>
    </>
  );

  return (
    <>
      {/* Top Navigation Bar - Dark Theme */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="w-[95%] mx-auto flex items-center justify-between px-3 sm:px-6 py-3">
          {/* Left Side - Logo and Navigation Menu */}
          <div className="flex items-center gap-2 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="text-lg sm:text-xl font-bold text-emerald-400">MarketSensorAI</div>
              <Badge className="bg-emerald-500 text-white text-xs">LIVE</Badge>
            </Link>
            
            {/* Desktop Navigation Menu */}
            {!isMobile && (
              <div className="flex items-center gap-8">
                <NavigationLinks />
              </div>
            )}

            {/* Mobile Navigation Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-slate-900 border-slate-700">
                  <SheetHeader>
                    <SheetTitle className="text-emerald-400">Navigation</SheetTitle>
                    <SheetDescription className="text-slate-400">
                      Access all market sections
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
                    <NavigationLinks />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isMobile && (
              <span className="text-slate-400 text-sm font-medium">{formatTime(currentTime)}</span>
            )}
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-slate-800 text-xs sm:text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;
