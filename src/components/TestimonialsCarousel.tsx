import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "This cut my morning prep from 2 hours to 10 minutes.",
      author: "Sarah Chen, Portfolio Manager"
    },
    {
      quote: "Predictive impact analysis changed how I hedge risk.",
      author: "Michael Rodriguez, Day Trader"
    },
    {
      quote: "Chat commands feel like talking to my own analyst.",
      author: "Jennifer Walsh, Investment Advisor"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Desktop: Show all three testimonials */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 shadow-lg animate-fade-in"
              >
                <p className="text-muted-foreground italic mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <p className="text-sm font-medium">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: Show one testimonial with navigation */}
          <div className="md:hidden">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg min-h-[200px] flex flex-col justify-center">
              <p className="text-muted-foreground italic mb-4 leading-relaxed text-center">
                "{testimonials[currentIndex].quote}"
              </p>
              <p className="text-sm font-medium text-center">
                — {testimonials[currentIndex].author}
              </p>
            </div>
            
            {/* Navigation arrows */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft size={20} />
              </Button>
              
              {/* Dots indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-emerald-600' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;