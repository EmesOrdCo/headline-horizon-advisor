import { useEffect, useRef, useState } from "react";
import { Search, BarChart3, Zap } from "lucide-react";

const HowItWorksTimeline = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation of timeline items
            setTimeout(() => setVisibleItems([0]), 0);
            setTimeout(() => setVisibleItems([0, 1]), 200);
            setTimeout(() => setVisibleItems([0, 1, 2]), 400);
            setTimeout(() => setShowDemo(true), 600);
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

  const steps = [
    {
      icon: Search,
      title: "Scan & Highlight",
      description: "AI fetches and flags today's top headlines."
    },
    {
      icon: BarChart3,
      title: "Analyze & Predict",
      description: "Quantify expected price moves with real‑world data models."
    },
    {
      icon: Zap,
      title: "Trade Instantly",
      description: "Execute or automate trades via a single chat command."
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isVisible = visibleItems.includes(index);
            
            return (
              <div
                key={index}
                className={`text-center transition-all duration-600 ${
                  isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Icon size={40} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Demo Animation */}
        <div className="flex justify-center">
          <div 
            className={`w-3/5 max-w-lg transition-all duration-600 ${
              showDemo 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div className="h-3 bg-emerald-200 rounded animate-pulse"></div>
                <div className="h-3 bg-blue-200 rounded animate-pulse delay-100"></div>
                <div className="h-3 bg-purple-200 rounded animate-pulse delay-200"></div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Live Demo Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;