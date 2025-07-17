
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Showcase page to view all homepage layouts
const HomepageShowcase = () => {
  const layouts = [
    {
      id: 1,
      name: "Hero-Driven Layout",
      description: "Features a prominent hero section with breaking news and market impact analysis. Clean grid-based design with emphasis on the main story.",
      highlights: ["Large hero banner", "Featured story emphasis", "Market impact cards", "Top stories grid"],
      route: "/homepage1"
    },
    {
      id: 2,
      name: "News-First with Sidebar",
      description: "Traditional news layout with main content area and informative sidebar. Perfect for users who want quick access to market data alongside news.",
      highlights: ["Classic news layout", "Live market sidebar", "Breaking news focus", "AI insights panel"],
      route: "/homepage2"
    },
    {
      id: 3,
      name: "Dashboard-Style Widgets",
      description: "Modern dashboard approach with widget-based layout. Ideal for power users who want comprehensive market intelligence at a glance.",
      highlights: ["Quick stats row", "Widget-based design", "Featured analysis", "Live market data"],
      route: "/homepage3"
    },
    {
      id: 4,
      name: "Category-Based Sections",
      description: "Clean, organized layout with clear category divisions. Similar to Reuters with structured sections and visual hierarchy.",
      highlights: ["Category navigation", "Section-based organization", "Visual story cards", "Professional layout"],
      route: "/homepage4"
    },
    {
      id: 5,
      name: "Mixed Visual Emphasis",
      description: "Combines visual elements with data-driven content. Features hero banner, live stats, and column-based content organization.",
      highlights: ["Visual hero banner", "Live stats display", "Three-column layout", "Mixed content types"],
      route: "/homepage5"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      <main className="pt-24 px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center py-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Homepage Layout Options
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Explore 5 different homepage layouts designed for your financial news and AI analysis platform. 
              Each layout offers a unique approach to organizing content and engaging users.
            </p>
            <Link to="/">
              <Button variant="outline">
                Back to Current Homepage
              </Button>
            </Link>
          </div>

          {/* Layout Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {layouts.map((layout) => (
              <Card key={layout.id} className="border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Layout {layout.id}: {layout.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Link to={layout.route}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    {layout.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {layout.highlights.map((highlight, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-slate-400 flex items-center">
                          <ArrowRight className="w-3 h-3 mr-2 text-emerald-600" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link to={layout.route}>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      View Full Layout <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Implementation Notes */}
          <div className="mt-16 bg-slate-50 dark:bg-slate-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Implementation Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Design Principles</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Clean, professional typography</li>
                  <li>• Consistent spacing and visual hierarchy</li>
                  <li>• Mobile-responsive grid layouts</li>
                  <li>• Subtle shadows and hover effects</li>
                  <li>• Clear calls-to-action</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Features</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                  <li>• Reuses existing Navigation and MarketTicker</li>
                  <li>• Shadcn/ui components for consistency</li>
                  <li>• Dark mode support</li>
                  <li>• Optimized for performance</li>
                  <li>• SEO-friendly structure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomepageShowcase;
