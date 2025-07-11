
interface ConfidenceDotsProps {
  confidence: number;
}

export const ConfidenceDots = ({ confidence }: ConfidenceDotsProps) => {
  // Add debugging and convert confidence percentage to dots with defined ranges
  console.log(`ConfidenceDots received confidence: ${confidence}`);
  
  let dots = 1; // Default for anything below 60
  
  if (confidence >= 95) {
    dots = 5;
  } else if (confidence >= 86) {
    dots = 4;
  } else if (confidence >= 76) {
    dots = 3;
  } else if (confidence >= 66) {
    dots = 2;
  } else {
    dots = 1; // For 60-65 and below 60
  }
  
  console.log(`Confidence ${confidence}% converted to ${dots} dots`);
  
  const dotsToShow = dots;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= dotsToShow ? 'bg-cyan-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};
