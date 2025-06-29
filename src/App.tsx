
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MarketDataProvider } from "./contexts/MarketDataContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyStocks from "./pages/MyStocks";
import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import BiggestMovers from "./pages/BiggestMovers";
import Predictions from "./pages/Predictions";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import OnboardingEmail from "./pages/onboarding/OnboardingEmail";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingDetails from "./pages/onboarding/OnboardingDetails";
import OnboardingStocks from "./pages/onboarding/OnboardingStocks";
import OnboardingLoading from "./pages/onboarding/OnboardingLoading";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MarketDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/my-stocks" element={<ProtectedRoute><MyStocks /></ProtectedRoute>} />
              <Route path="/magnificent-7" element={<ProtectedRoute><Magnificent7 /></ProtectedRoute>} />
              <Route path="/index-funds" element={<ProtectedRoute><IndexFunds /></ProtectedRoute>} />
              <Route path="/biggest-movers" element={<ProtectedRoute><BiggestMovers /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="/detailed-analysis/:id" element={<ProtectedRoute><DetailedAnalysis /></ProtectedRoute>} />
              <Route path="/onboarding/email" element={<OnboardingEmail />} />
              <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
              <Route path="/onboarding/details" element={<OnboardingDetails />} />
              <Route path="/onboarding/stocks" element={<OnboardingStocks />} />
              <Route path="/onboarding/loading" element={<OnboardingLoading />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MarketDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
