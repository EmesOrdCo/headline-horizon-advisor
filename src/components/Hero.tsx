import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const [showMockup, setShowMockup] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "What news will move my positions today?";

  useEffect(() => {
    // Trigger mockup animation
    const mockupTimer = setTimeout(() => setShowMockup(true), 300);
    
    // Trigger chat bubble animation
    const bubbleTimer = setTimeout(() => setShowChatBubble(true), 800);
    
    // Typing effect
    const typingTimer = setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < fullText.length) {
          setTypedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
    }, 1200);

    return () => {
      clearTimeout(mockupTimer);
      clearTimeout(bubbleTimer);
      clearTimeout(typingTimer);
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center px-6 pt-24">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Take the{" "}
              <span className="text-emerald-400">Guesswork</span>{" "}
              Out of Trading
            </h1>
            
            <p className="text-lg lg:text-2xl text-muted-foreground leading-relaxed">
              AI‑powered market news, price‑impact predictions, and one‑click trading—all in one chat‑driven copilot.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 transition-transform"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 transition-transform"
                  >
                    Get Early Access
                  </Button>
                </Link>
              )}
              
              <a href="#how-it-works" className="inline-flex items-center text-emerald-400 hover:underline text-lg">
                See How It Works →
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div 
              className={`transition-all duration-600 ${
                showMockup 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden w-3/4 mx-auto">
                <div className="bg-secondary p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-emerald-100 rounded"></div>
                    <div className="h-20 bg-red-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Bubble Animation */}
            {showChatBubble && (
              <div className="absolute bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-lg max-w-xs shadow-lg animate-fade-in">
                <div className="text-sm">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </div>
                <div className="absolute bottom-0 right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-emerald-600 transform translate-y-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;