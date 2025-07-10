
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const { user } = useAuth();

  return (
    <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 sm:mb-8">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-slate-500 line-through">$199</span>{" "}
            <span className="text-yellow-400">$99*</span>
          </div>
          <p className="text-lg sm:text-xl text-slate-300 px-4">
            For a year of full access — that's just $1.90 a week!
          </p>
        </div>
        
        <Link to={user ? "/dashboard" : "/onboarding/email"}>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl mb-4 sm:mb-6 w-full sm:w-auto">
            Start Your Free Trial
          </Button>
        </Link>
        
        <div className="flex items-center justify-center gap-2 text-slate-400 px-4">
          <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-slate-400 rounded-sm"></div>
          </div>
          <span className="text-sm sm:text-base">Includes 7-day free trial period with full access</span>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
