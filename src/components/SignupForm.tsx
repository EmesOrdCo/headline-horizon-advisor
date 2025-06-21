
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  email: string;
  gender: string;
  language: string;
  country: string;
  tradingExperience: string;
  portfolioValue: string;
  stocks: string[];
  riskTolerance: string;
  tradingStyle: string[];
}

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    gender: "",
    language: "English (UK)",
    country: "United Kingdom",
    tradingExperience: "",
    portfolioValue: "",
    stocks: [],
    riskTolerance: "",
    tradingStyle: []
  });
  const [stockInput, setStockInput] = useState("");

  const addStock = () => {
    if (stockInput.trim() && !profile.stocks.includes(stockInput.trim().toUpperCase())) {
      setProfile(prev => ({
        ...prev,
        stocks: [...prev.stocks, stockInput.trim().toUpperCase()]
      }));
      setStockInput("");
    }
  };

  const removeStock = (stock: string) => {
    setProfile(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== stock)
    }));
  };

  const handleStyleToggle = (style: string) => {
    setProfile(prev => ({
      ...prev,
      tradingStyle: prev.tradingStyle.includes(style)
        ? prev.tradingStyle.filter(s => s !== style)
        : [...prev.tradingStyle, style]
    }));
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progressWidth = (step / 6) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8">
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div 
              className="bg-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          {step > 1 && (
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 1 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to StockPredict AI
            </h1>
            <p className="text-gray-600 mb-6">
              Let's personalize your trading experience. We won't show this on your profile.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              What's your gender?
            </h1>
            <p className="text-gray-600 mb-8">
              This helps us find more relevant content for you. We won't show it on your profile.
            </p>
            <div className="space-y-4">
              {['Female', 'Male', 'Specify another'].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={profile.gender === option}
                    onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-5 h-5"
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              What's your trading experience?
            </h1>
            <p className="text-gray-600 mb-8">
              This helps us customize your dashboard and recommendations.
            </p>
            <div className="space-y-4">
              {[
                'Complete beginner',
                'Some experience (< 1 year)',
                'Intermediate (1-3 years)',
                'Advanced (3+ years)',
                'Professional trader'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    value={option}
                    checked={profile.tradingExperience === option}
                    onChange={(e) => setProfile(prev => ({ ...prev, tradingExperience: e.target.value }))}
                    className="w-5 h-5"
                  />
                  <span className="text-lg text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              What stocks are you currently holding?
            </h1>
            <p className="text-gray-600 mb-6">
              Add your current positions so we can provide personalized alerts.
            </p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value.toUpperCase())}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  onKeyPress={(e) => e.key === 'Enter' && addStock()}
                />
                <Button onClick={addStock} className="bg-red-500 hover:bg-red-600">
                  Add
                </Button>
              </div>
              {profile.stocks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.stocks.map((stock) => (
                    <Badge key={stock} variant="secondary" className="flex items-center gap-1">
                      {stock}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeStock(stock)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              What's your trading style?
            </h1>
            <p className="text-gray-600 mb-6">
              Select all that apply to get the most relevant predictions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Day Trading',
                'Swing Trading',
                'Position Trading',
                'Scalping',
                'Growth Investing',
                'Value Investing'
              ].map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleToggle(style)}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    profile.tradingStyle.includes(style)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{style}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Perfect! You're all set.
            </h1>
            <p className="text-gray-600 mb-6">
              We're personalizing your StockPredict AI experience based on your preferences.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Experience:</strong> {profile.tradingExperience}</p>
                <p><strong>Stocks:</strong> {profile.stocks.join(', ') || 'None added'}</p>
                <p><strong>Trading Style:</strong> {profile.tradingStyle.join(', ') || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={
            (step === 1 && !profile.email) ||
            (step === 2 && !profile.gender) ||
            (step === 3 && !profile.tradingExperience)
          }
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full text-lg font-medium mt-8"
        >
          {step === 6 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default SignupForm;
