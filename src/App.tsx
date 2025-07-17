import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardVariant1 from "./pages/DashboardVariant1";
import DashboardVariant2 from "./pages/DashboardVariant2";
import DashboardVariant3 from "./pages/DashboardVariant3";
import DashboardVariant4 from "./pages/DashboardVariant4";
import DashboardVariant5 from "./pages/DashboardVariant5";
import DashboardShowcase from "./pages/DashboardShowcase";
import MyStocks from "./pages/MyStocks";
import BiggestMovers from "./pages/BiggestMovers";
import Magnificent7 from "./pages/Magnificent7";
import IndexFunds from "./pages/IndexFunds";
import Predictions from "./pages/Predictions";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/my-stocks"
              element={
                <ProtectedRoute>
                  <MyStocks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biggest-movers"
              element={
                <ProtectedRoute>
                  <BiggestMovers />
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
              path="/dashboard-variant-1"
              element={
                <ProtectedRoute>
                  <DashboardVariant1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-variant-2"
              element={
                <ProtectedRoute>
                  <DashboardVariant2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-variant-3"
              element={
                <ProtectedRoute>
                  <DashboardVariant3 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-variant-4"
              element={
                <ProtectedRoute>
                  <DashboardVariant4 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-variant-5"
              element={
                <ProtectedRoute>
                  <DashboardVariant5 />
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
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
