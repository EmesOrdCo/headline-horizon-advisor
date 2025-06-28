
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="px-6 py-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
            Take the <span className="text-emerald-400">Guesswork</span><br />
            out of <span className="text-blue-400">Investing</span>
          </h1>
          <p className="text-xl text-slate-300 mb-6 leading-relaxed">
            We believe smart investing should be powered by AI. That's why{" "}
            <span className="text-emerald-400 font-semibold">StockPredict AI</span> takes the guesswork out of stock picks by keeping you 
            informed with real-time analysis and predictions.
          </p>
          <p className="text-lg text-slate-400 mb-8">
            As a member, you'll receive ongoing AI-powered market insights, so you can spend less 
            time researching and more time profiting.
          </p>
          <div className="flex items-center gap-4 mb-8">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                  Go to Dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/onboarding/email">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                    Start Free Trial →
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg">
                    Log In
                  </Button>
                </Link>
              </>
            )}
          </div>
          {!user && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-400 rounded-sm"></div>
              </div>
              <span>Includes 7-day free trial. No credit card required.</span>
            </div>
          )}
        </div>
        
        <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 text-white">DASHBOARD PREVIEW</Badge>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Your AI-Powered Investment Dashboard</h3>
          
          <div className="relative rounded-lg overflow-hidden border border-slate-600">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop" 
              alt="Dashboard Preview - Monitor showing data analysis"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-medium mb-2">Real-time market analysis at your fingertips</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-xs">Live data streaming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
