
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ArticleWeight {
  article_index: number;
  weight: number;
  reasoning: string;
}

interface UseArticleWeightsProps {
  articles: Array<{
    title: string;
    description?: string;
    published_at: string;
  }>;
  overallSentiment: string;
  overallConfidence: number;
  symbol: string;
  enabled?: boolean;
}

export const useArticleWeights = ({
  articles,
  overallSentiment,
  overallConfidence,
  symbol,
  enabled = true
}: UseArticleWeightsProps) => {
  return useQuery({
    queryKey: ['article-weights', symbol, articles.length, overallSentiment, overallConfidence],
    queryFn: async (): Promise<ArticleWeight[]> => {
      if (!articles || articles.length === 0) {
        return [];
      }

      console.log(`Calculating weights for ${symbol} with ${articles.length} articles...`);

      const { data, error } = await supabase.functions.invoke('calculate-article-weights', {
        body: {
          articles,
          overallSentiment,
          overallConfidence,
          symbol
        }
      });

      if (error) {
        console.error('Error calculating article weights:', error);
        throw error;
      }

      return data.weights || [];
    },
    enabled: enabled && articles && articles.length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour (increased from 30 minutes)
    retry: 1,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};
