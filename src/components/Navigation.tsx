
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          BETA
        </Badge>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
        <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
        <Link to="/dashboard">
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            Sign In
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
