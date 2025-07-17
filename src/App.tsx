
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyStocks from "./pages/MyStocks";
import Watchlist from "./pages/Watchlist";
import BiggestMovers from "./pages/BiggestMovers";
import Predictions from "./pages/Predictions";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import OnboardingEmail from "./pages/onboarding/OnboardingEmail";
import OnboardingDetails from "./pages/onboarding/OnboardingDetails";
import OnboardingStocks from "./pages/onboarding/OnboardingStocks";
import OnboardingLoading from "./pages/onboarding/OnboardingLoading";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import EmailConfirmation from "./pages/EmailConfirmation";
import Homepage1 from "./pages/Homepage1";
import Homepage2 from "./pages/Homepage2";
import Homepage3 from "./pages/Homepage3";
import Homepage4 from "./pages/Homepage4";
import Homepage5 from "./pages/Homepage5";
import HomepageShowcase from "./pages/HomepageShowcase";
import DashboardShowcase from "./pages/DashboardShowcase";
import IndexFunds from "./pages/IndexFunds";
import Magnificent7 from "./pages/Magnificent7";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/email" element={<OnboardingEmail />} />
              <Route path="/onboarding/details" element={<OnboardingDetails />} />
              <Route path="/onboarding/stocks" element={<OnboardingStocks />} />
              <Route path="/onboarding/loading" element={<OnboardingLoading />} />
              <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
              <Route path="/homepage1" element={<Homepage1 />} />
              <Route path="/homepage2" element={<Homepage2 />} />
              <Route path="/homepage3" element={<Homepage3 />} />
              <Route path="/homepage4" element={<Homepage4 />} />
              <Route path="/homepage5" element={<Homepage5 />} />
              <Route path="/homepage-showcase" element={<HomepageShowcase />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/my-stocks" element={<ProtectedRoute><MyStocks /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
              <Route path="/biggest-movers" element={<ProtectedRoute><BiggestMovers /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="/analysis/:id" element={<ProtectedRoute><DetailedAnalysis /></ProtectedRoute>} />
              <Route path="/dashboard-showcase" element={<ProtectedRoute><DashboardShowcase /></ProtectedRoute>} />
              <Route path="/index-funds" element={<ProtectedRoute><IndexFunds /></ProtectedRoute>} />
              <Route path="/magnificent-7" element={<ProtectedRoute><Magnificent7 /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
