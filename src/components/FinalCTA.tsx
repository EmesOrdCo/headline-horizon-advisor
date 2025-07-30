import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

const FinalCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    window.location.href = '/auth';
  };

  const perks = [
    "Unlimited news scans",
    "Realtime impact forecasts", 
    "Priority support"
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div 
            className={`transition-all duration-600 ${
              isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Trade Smarter?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join our beta now and be first to skip the guesswork.
            </p>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get Early Access
              </Button>
            </form>
          </div>

          {/* Right Column */}
          <div 
            className={`transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="text-2xl font-bold mb-4">Starting at $29/month</div>
              
              <div className="space-y-3">
                {perks.map((perk, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check size={20} className="text-emerald-600 flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;