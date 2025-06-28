
import { cn } from "@/lib/utils";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgressBar = ({ currentStep, totalSteps }: OnboardingProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-slate-700 h-1 mb-8">
      <div 
        className="bg-emerald-500 h-1 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default OnboardingProgressBar;
