
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingEmail from "./onboarding/OnboardingEmail";
import OnboardingDetails from "./onboarding/OnboardingDetails";
import OnboardingWelcome from "./onboarding/OnboardingWelcome";
import OnboardingStocks from "./onboarding/OnboardingStocks";
import OnboardingLoading from "./onboarding/OnboardingLoading";

const Onboarding = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/email" element={<OnboardingEmail />} />
      <Route path="/details" element={<OnboardingDetails />} />
      <Route path="/welcome" element={<OnboardingWelcome />} />
      <Route path="/stocks" element={<OnboardingStocks />} />
      <Route path="/loading" element={<OnboardingLoading />} />
      <Route path="*" element={<Navigate to="/onboarding/email" replace />} />
    </Routes>
  );
};

export default Onboarding;
