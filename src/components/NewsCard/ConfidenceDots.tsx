
interface ConfidenceDotsProps {
  confidence: number;
}

export const ConfidenceDots = ({ confidence }: ConfidenceDotsProps) => {
  // Convert percentage to dots with better granularity (0-100% -> 0-5 dots)
  // Use Math.floor to be more conservative and show clearer differences
  const dots = Math.max(0, Math.min(5, Math.floor((confidence / 20) + 0.5)));
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= dots ? 'bg-cyan-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};
