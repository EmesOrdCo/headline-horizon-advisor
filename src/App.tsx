
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RefreshProvider } from "./contexts/RefreshContext";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardShowcase from "./pages/DashboardShowcase";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Watchlist from "./pages/Watchlist";

import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import Predictions from "./pages/Predictions";
import StockDetail from "./pages/StockDetail";
import Wallet from "./pages/Wallet";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RefreshProvider>
      <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/stock/:symbol"
                element={
                  <ProtectedRoute>
                    <StockDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/magnificent-7"
                element={
                  <ProtectedRoute>
                    <Magnificent7 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/index-funds"
                element={
                  <ProtectedRoute>
                    <IndexFunds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predictions"
                element={
                  <ProtectedRoute>
                    <Predictions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-showcase"
                element={
                  <ProtectedRoute>
                    <DashboardShowcase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </RefreshProvider>
  </QueryClientProvider>
);

export default App;
