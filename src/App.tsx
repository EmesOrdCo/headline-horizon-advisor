
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Home1 from "./pages/Home1";
import HomeOption1 from "./pages/HomeOption1";
import HomeOption2 from "./pages/HomeOption2";
import HomeOption3 from "./pages/HomeOption3";
import MyStocks from "./pages/MyStocks";
import Onboarding from "./pages/Onboarding";
import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import BiggestMovers from "./pages/BiggestMovers";
import Predictions from "./pages/Predictions";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/home1" element={
                  <ProtectedRoute>
                    <Home1 />
                  </ProtectedRoute>
                } />
                <Route path="/home-option1" element={
                  <ProtectedRoute>
                    <HomeOption1 />
                  </ProtectedRoute>
                } />
                <Route path="/home-option2" element={
                  <ProtectedRoute>
                    <HomeOption2 />
                  </ProtectedRoute>
                } />
                <Route path="/home-option3" element={
                  <ProtectedRoute>
                    <HomeOption3 />
                  </ProtectedRoute>
                } />
                <Route path="/my-stocks" element={
                  <ProtectedRoute>
                    <MyStocks />
                  </ProtectedRoute>
                } />
                <Route path="/magnificent-7" element={
                  <ProtectedRoute>
                    <Magnificent7 />
                  </ProtectedRoute>
                } />
                <Route path="/index-funds" element={
                  <ProtectedRoute>
                    <IndexFunds />
                  </ProtectedRoute>
                } />
                <Route path="/biggest-movers" element={
                  <ProtectedRoute>
                    <BiggestMovers />
                  </ProtectedRoute>
                } />
                <Route path="/predictions" element={
                  <ProtectedRoute>
                    <Predictions />
                  </ProtectedRoute>
                } />
                <Route path="/analysis/:id" element={
                  <ProtectedRoute>
                    <DetailedAnalysis />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
