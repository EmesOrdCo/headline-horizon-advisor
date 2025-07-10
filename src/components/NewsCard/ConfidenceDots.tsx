
interface ConfidenceDotsProps {
  confidence: number;
}

export const ConfidenceDots = ({ confidence }: ConfidenceDotsProps) => {
  // Convert percentage to dots (0-100% -> 0-5 dots)
  const dots = Math.round((confidence / 100) * 5);
  
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
