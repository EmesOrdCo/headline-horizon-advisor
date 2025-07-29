
interface DetailedAnalysisProps {
  symbol: string;
  sentiment: string;
  confidence: number;
  aiReasoning?: string;
}

export const DetailedAnalysis = ({ symbol, sentiment, confidence, aiReasoning }: DetailedAnalysisProps) => {
  // Use real AI reasoning if available, otherwise generate fallback
  const getAnalysisText = () => {
    // If we have real AI reasoning and it's not the generic fallback, use it
    if (aiReasoning && !aiReasoning.includes('Analysis based on') && aiReasoning.length > 50) {
      return aiReasoning;
    }
    
    // Otherwise use the original template logic as fallback
    const sentimentText = sentiment?.toLowerCase() || 'neutral';
    
    if (sentimentText === 'bullish' && confidence > 70) {
      return `Strong positive indicators suggest ${symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidence > 70) {
      return `This news presents concerning factors for ${symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidence <= 70) {
      return `Moderate positive signals for ${symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidence <= 70) {
      return `Some negative factors identified for ${symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
    }
  };

  return (
    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
      <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
        <span className="text-cyan-400 font-medium">Detailed Analysis:</span> {getAnalysisText()}
      </p>
    </div>
  );
};
