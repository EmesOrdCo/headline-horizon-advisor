import { useEffect, useRef, useState } from "react";
import { Newspaper, TrendingUp, MessageSquare } from "lucide-react";

const KeyFeatures = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation of items
            setTimeout(() => setVisibleItems([0]), 0);
            setTimeout(() => setVisibleItems([0, 1]), 200);
            setTimeout(() => setVisibleItems([0, 1, 2]), 400);
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

  const features = [
    {
      icon: Newspaper,
      title: "Real‑Time News Aggregation",
      description: "Automatically surface market‑moving headlines from 50+ sources—no more tab switching."
    },
    {
      icon: TrendingUp,
      title: "AI Price Impact Analysis", 
      description: "Quantify expected price moves for each story—know the impact before you act."
    },
    {
      icon: MessageSquare,
      title: "Chat‑Driven Execution",
      description: "Ask your copilot to place, monitor, or hedge trades—all within chat."
    }
  ];

  return (
    <section id="features" ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">All the Tools You Need in One Copilot</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleItems.includes(index);
            
            return (
              <div
                key={index}
                className={`bg-card border border-border rounded-xl p-6 text-center transition-all duration-600 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <Icon size={64} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;