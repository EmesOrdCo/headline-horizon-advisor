
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
import BrokerDashboard from "./pages/BrokerDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DisplaySettings from "./pages/settings/DisplaySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import PrivacySettings from "./pages/settings/PrivacySettings";
import RecurringOrdersSettings from "./pages/settings/RecurringOrdersSettings";
import TradingSettings from "./pages/settings/TradingSettings";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import MyStocks from "./pages/MyStocks";
import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import Predictions from "./pages/Predictions";
import StockDetail from "./pages/StockDetail";
import StockChart from "./pages/StockChart";
import StockAnalysis from "./pages/StockAnalysis";
import StockData from "./pages/StockData";
import Wallet from "./pages/Wallet";
import Onboarding from "./pages/Onboarding";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingDetails from "./pages/onboarding/OnboardingDetails";
import OnboardingEmail from "./pages/onboarding/OnboardingEmail";
import OnboardingStocks from "./pages/onboarding/OnboardingStocks";
import OnboardingLoading from "./pages/onboarding/OnboardingLoading";
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
                path="/broker"
                element={
                  <ProtectedRoute>
                    <BrokerDashboard />
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
                path="/settings/display"
                element={
                  <ProtectedRoute>
                    <DisplaySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/privacy"
                element={
                  <ProtectedRoute>
                    <PrivacySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/recurring-orders"
                element={
                  <ProtectedRoute>
                    <RecurringOrdersSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/trading"
                element={
                  <ProtectedRoute>
                    <TradingSettings />
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
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-stocks"
                element={
                  <ProtectedRoute>
                    <MyStocks />
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
              <Route
                path="/stock-chart/:symbol"
                element={
                  <ProtectedRoute>
                    <StockChart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock-analysis/:symbol"
                element={
                  <ProtectedRoute>
                    <StockAnalysis />
                  </ProtectedRoute>
                }
              />
              {/* Onboarding Routes */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
              <Route path="/onboarding/details" element={<OnboardingDetails />} />
              <Route path="/onboarding/email" element={<OnboardingEmail />} />
              <Route path="/onboarding/stocks" element={<OnboardingStocks />} />
              <Route path="/onboarding/loading" element={<OnboardingLoading />} />
              <Route
                path="/stock-data/:symbol"
                element={
                  <ProtectedRoute>
                    <StockData />
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
