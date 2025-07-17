
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const DashboardLinks = () => (
    <>
      <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors font-medium">
        Dashboard
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-slate-300 hover:text-white transition-colors font-medium">
            Layouts
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-800 border-slate-700">
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="text-slate-300 hover:text-white w-full">
              Current Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-variant-1" className="text-slate-300 hover:text-white w-full">
              Hero-Driven Layout
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-variant-2" className="text-slate-300 hover:text-white w-full">
              News-First Design
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-variant-3" className="text-slate-300 hover:text-white w-full">
              Widget Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-variant-4" className="text-slate-300 hover:text-white w-full">
              Category Sections
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-variant-5" className="text-slate-300 hover:text-white w-full">
              Mixed Visual Emphasis
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard-showcase" className="text-slate-300 hover:text-white w-full">
              Layout Showcase
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
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
                <DashboardLinks />
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
                      Access all market sections and dashboard layouts
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
                    <DashboardLinks />
                    
                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-slate-400 text-sm mb-3">Dashboard Layouts:</p>
                      <div className="flex flex-col gap-3 ml-4">
                        <Link to="/dashboard-variant-1" className="text-slate-300 hover:text-white transition-colors text-sm">
                          Hero-Driven Layout
                        </Link>
                        <Link to="/dashboard-variant-2" className="text-slate-300 hover:text-white transition-colors text-sm">
                          News-First Design
                        </Link>
                        <Link to="/dashboard-variant-3" className="text-slate-300 hover:text-white transition-colors text-sm">
                          Widget Dashboard
                        </Link>
                        <Link to="/dashboard-variant-4" className="text-slate-300 hover:text-white transition-colors text-sm">
                          Category Sections
                        </Link>
                        <Link to="/dashboard-variant-5" className="text-slate-300 hover:text-white transition-colors text-sm">
                          Mixed Visual Emphasis
                        </Link>
                        <Link to="/dashboard-showcase" className="text-slate-300 hover:text-white transition-colors text-sm">
                          Layout Showcase
                        </Link>
                      </div>
                    </div>
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
