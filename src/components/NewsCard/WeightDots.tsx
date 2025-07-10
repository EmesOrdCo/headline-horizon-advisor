
interface WeightDotsProps {
  weight: number;
}

export const WeightDots = ({ weight }: WeightDotsProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= weight ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
};
