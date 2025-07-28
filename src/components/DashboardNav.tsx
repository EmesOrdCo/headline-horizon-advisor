
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Settings, Zap, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import FeedbackModal from "./FeedbackModal";
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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
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
      <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors font-medium text-lg">
        Home
      </Link>
      <Link to="/portfolio" className="text-slate-300 hover:text-white transition-colors font-medium text-lg">
        Portfolio
      </Link>
      
      <Link to="/watchlist" className="text-slate-300 hover:text-white transition-colors font-medium text-lg">
        Watchlist
      </Link>
      
      <Link to="/wallet" className="text-slate-300 hover:text-white transition-colors font-medium text-lg">
        Wallet
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
                      Access all market sections
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
                    <DashboardLinks />
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

            {/* Notifications Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Bell className="w-6 h-6" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <User className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-slate-800 border-slate-700 text-slate-200"
              >
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                  <Zap className="w-4 h-4 mr-3" />
                  Feature Walkthroughs
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Give Feedback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
};

export default DashboardNav;
