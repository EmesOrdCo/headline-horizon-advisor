import React from 'react';
import { SourceArticles } from '@/components/NewsCard/SourceArticles';
import { useArticleWeights } from '@/hooks/useArticleWeights';

interface SourceArticlesWithWeightsProps {
  sourceArticles: any[];
  symbol: string;
  isHistorical: boolean;
  overallSentiment: string;
  overallConfidence: number;
}

export const SourceArticlesWithWeights: React.FC<SourceArticlesWithWeightsProps> = ({
  sourceArticles,
  symbol,
  isHistorical,
  overallSentiment,
  overallConfidence
}) => {
  // Get article weights 
  const { data: articleWeights, isLoading: weightsLoading } = useArticleWeights({
    articles: sourceArticles,
    overallSentiment,
    overallConfidence,
    symbol,
    enabled: sourceArticles.length > 0 && !isHistorical
  });

  console.log(`🔍 Weights for ${symbol}:`, articleWeights);

  return (
    <SourceArticles 
      parsedSourceLinks={sourceArticles}
      isHistorical={isHistorical}
      articleWeights={articleWeights}
      weightsLoading={weightsLoading}
    />
  );
};