import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const WhyDifferent = () => {
  const [isVisible, setIsVisible] = useState(false);
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
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-background border-t-4 border-emerald-400">
      <div className="max-w-lg mx-auto px-6 text-center">
        <div 
          className={`transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xl leading-relaxed text-foreground mb-8">
            Unlike standalone news feeds or trading apps, we combine{" "}
            <strong>news</strong>, <strong>analysis</strong>, and{" "}
            <strong>trading</strong> into one AI‑driven chat interface—so you 
            never lose context or miss an opportunity.
          </p>
          
          <Button 
            size="lg" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Compare Plans
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;