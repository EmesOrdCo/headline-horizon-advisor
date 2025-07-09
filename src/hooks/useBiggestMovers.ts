
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MoverStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  headlines: Array<{
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
  }>;
  overallImpact?: string;
  marketSentiment?: string;
  sentimentReasoning?: string;
}

interface BiggestMoversData {
  gainers: MoverStock[];
  losers: MoverStock[];
  lastUpdated: string;
}

// Quickselect algorithm (Hoare's selection algorithm) for efficient top-k selection
const quickselect = (arr: MoverStock[], k: number, compareFn: (a: MoverStock, b: MoverStock) => number): MoverStock[] => {
  if (k >= arr.length) return [...arr].sort(compareFn);
  
  const result = [...arr];
  
  const partition = (low: number, high: number, pivotIndex: number): number => {
    const pivotValue = result[pivotIndex];
    [result[pivotIndex], result[high]] = [result[high], result[pivotIndex]];
    
    let storeIndex = low;
    for (let i = low; i < high; i++) {
      if (compareFn(result[i], pivotValue) < 0) {
        [result[i], result[storeIndex]] = [result[storeIndex], result[i]];
        storeIndex++;
      }
    }
    [result[storeIndex], result[high]] = [result[high], result[storeIndex]];
    return storeIndex;
  };
  
  const select = (low: number, high: number, k: number): void => {
    if (low < high) {
      const pivotIndex = low + Math.floor(Math.random() * (high - low + 1));
      const newPivotIndex = partition(low, high, pivotIndex);
      
      if (newPivotIndex === k) {
        return;
      } else if (newPivotIndex > k) {
        select(low, newPivotIndex - 1, k);
      } else {
        select(newPivotIndex + 1, high, k);
      }
    }
  };
  
  select(0, result.length - 1, k - 1);
  return result.slice(0, k).sort(compareFn);
};

export const useBiggestMovers = () => {
  return useQuery({
    queryKey: ['biggest-movers-analyzed'],
    queryFn: async (): Promise<BiggestMoversData> => {
      console.log('Fetching analyzed biggest movers data...');
      
      const { data, error } = await supabase.functions.invoke('get-biggest-movers');
      
      if (error) {
        console.error('Error fetching biggest movers:', error);
        throw error;
      }
      
      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }
      
      console.log(`Processed biggest movers with ${data.gainers?.length || 0} gainers and ${data.losers?.length || 0} losers`);
      
      return {
        gainers: data.gainers || [],
        losers: data.losers || [],
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1
  });
};
