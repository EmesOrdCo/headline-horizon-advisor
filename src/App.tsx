
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Homepage1 from "./pages/Homepage1";
import Homepage2 from "./pages/Homepage2";
import Homepage3 from "./pages/Homepage3";
import Homepage4 from "./pages/Homepage4";
import Homepage5 from "./pages/Homepage5";
import HomepageShowcase from "./pages/HomepageShowcase";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import EmailConfirmation from "./pages/EmailConfirmation";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import BiggestMovers from "./pages/BiggestMovers";
import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import MyStocks from "./pages/MyStocks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/homepage1" element={<Homepage1 />} />
              <Route path="/homepage2" element={<Homepage2 />} />
              <Route path="/homepage3" element={<Homepage3 />} />
              <Route path="/homepage4" element={<Homepage4 />} />
              <Route path="/homepage5" element={<Homepage5 />} />
              <Route path="/homepage-showcase" element={<HomepageShowcase />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/onboarding/*" element={<Onboarding />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="/analysis/:symbol" element={<ProtectedRoute><DetailedAnalysis /></ProtectedRoute>} />
              <Route path="/biggest-movers" element={<ProtectedRoute><BiggestMovers /></ProtectedRoute>} />
              <Route path="/magnificent-7" element={<ProtectedRoute><Magnificent7 /></ProtectedRoute>} />
              <Route path="/index-funds" element={<ProtectedRoute><IndexFunds /></ProtectedRoute>} />
              <Route path="/my-stocks" element={<ProtectedRoute><MyStocks /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
