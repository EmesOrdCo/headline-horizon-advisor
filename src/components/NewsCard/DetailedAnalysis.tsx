
interface DetailedAnalysisProps {
  symbol: string;
  sentiment: string;
  confidence: number;
}

export const DetailedAnalysis = ({ symbol, sentiment, confidence }: DetailedAnalysisProps) => {
  // Helper function to generate AI analysis paragraph
  const generateAnalysisParagraph = (item: any) => {
    const sentimentText = item.ai_sentiment?.toLowerCase() || 'neutral';
    const confidence = item.ai_confidence || 50;
    
    // Generate contextual analysis based on sentiment and confidence
    if (sentimentText === 'bullish' && confidence > 70) {
      return `Strong positive indicators suggest ${item.symbol} may benefit from this development. Market sentiment appears favorable with high confidence in upward momentum.`;
    } else if (sentimentText === 'bearish' && confidence > 70) {
      return `This news presents concerning factors for ${item.symbol} performance. Analysis indicates potential downward pressure with significant market implications.`;
    } else if (sentimentText === 'bullish' && confidence <= 70) {
      return `Moderate positive signals for ${item.symbol}, though market uncertainty remains. Cautious optimism warranted given mixed indicators and evolving conditions.`;
    } else if (sentimentText === 'bearish' && confidence <= 70) {
      return `Some negative factors identified for ${item.symbol}, but impact unclear. Market conditions suggest careful monitoring of developments ahead.`;
    } else {
      return `Mixed signals for ${item.symbol} with neutral market impact expected. Analysis suggests balanced risk-reward profile in current environment.`;
    }
  };

  return (
    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 mb-4">
      <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
        <span className="text-cyan-400 font-medium">Detailed Analysis:</span> {generateAnalysisParagraph({ symbol, ai_sentiment: sentiment, ai_confidence: confidence })}
      </p>
    </div>
  );
};
