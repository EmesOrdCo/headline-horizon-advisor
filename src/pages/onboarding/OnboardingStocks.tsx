
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'UBER', name: 'Uber Technologies' },
  { symbol: 'SPOT', name: 'Spotify Technology' },
  { symbol: 'SQ', name: 'Block Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'ZM', name: 'Zoom Video Communications' },
  { symbol: 'ROKU', name: 'Roku Inc.' },
  { symbol: 'TWTR', name: 'Twitter Inc.' },
  { symbol: 'SNAP', name: 'Snap Inc.' },
  { symbol: 'BA', name: 'Boeing Company' },
  { symbol: 'DIS', name: 'Walt Disney Company' }
];

const OnboardingStocks = () => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/onboarding/email');
    }
  }, [user, navigate]);

  const handleStockToggle = (symbol: string) => {
    setSelectedStocks(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleContinue = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save selected stocks
      if (selectedStocks.length > 0) {
        const stockData = selectedStocks.map(symbol => ({
          user_id: user.id,
          symbol
        }));

        const { error } = await supabase
          .from('user_stocks')
          .insert(stockData);

        if (error) {
          toast({
            title: "Failed to save stocks",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      navigate('/onboarding/loading');
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/loading');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding/welcome')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <OnboardingProgressBar currentStep={4} totalSteps={5} />
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 mb-2">
              Which stocks do you have positions in?
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Help us personalize your account by selecting the stocks you're currently invested in. 
              This will help us provide more relevant insights and analysis.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {POPULAR_STOCKS.map((stock) => (
                <Card 
                  key={stock.symbol}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedStocks.includes(stock.symbol)
                      ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => handleStockToggle(stock.symbol)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedStocks.includes(stock.symbol)}
                        onChange={() => handleStockToggle(stock.symbol)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedStocks.length > 0 && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                  <strong>{selectedStocks.length}</strong> stocks selected:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedStocks.map((symbol) => (
                    <span
                      key={symbol}
                      className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs rounded-full"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleContinue}
                className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 sm:flex-none h-11"
              >
                Select later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStocks;
