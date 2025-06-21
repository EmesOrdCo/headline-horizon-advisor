
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
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
            <input 
              type="email" 
              placeholder="Enter your email"
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 flex-1 max-w-sm focus:outline-none focus:border-emerald-500"
            />
            <Link to="/dashboard">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                Start Free Trial →
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-400 rounded-sm"></div>
            </div>
            <span>Includes 7-day free trial. No credit card required.</span>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 text-white">AAPL</Badge>
            <Badge className="bg-blue-500 text-white text-xs">AI PREDICTION</Badge>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Apple beats Q4 earnings by 15%</h3>
          <p className="text-slate-300 mb-4">AI predicts continued upward momentum based on historical patterns</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-400">Current Price</div>
              <div className="text-2xl font-bold text-white">$178.50</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">24h Prediction</div>
              <div className="text-2xl font-bold text-emerald-400">$182.30</div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Confidence Level</span>
              <span className="text-emerald-400 font-semibold">85%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
