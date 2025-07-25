import { supabase } from '@/integrations/supabase/client';

export interface FinnhubMetrics {
  // Valuation metrics
  marketCap?: number;
  peRatio?: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  enterpriseValue?: number;
  evToEbitda?: number;
  
  // Financial health
  currentRatio?: number;
  quickRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  debtToEquity?: number;
  
  // Dividends
  dividendYield?: number;
  dividendPerShare?: number;
  payoutRatio?: number;
  
  // Growth metrics
  revenueGrowth?: number;
  earningsGrowth?: number;
  
  // Additional metrics
  beta?: number;
  eps?: number;
  bookValuePerShare?: number;
  
  // 52-week data
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export const fetchFinnhubMetrics = async (symbol: string): Promise<FinnhubMetrics> => {
  console.log('Finnhub Service: Starting fetch for symbol:', symbol);
  
  try {
    console.log('Finnhub Service: Calling Supabase edge function...');
    
    const { data, error } = await supabase.functions.invoke('fetch-finnhub-metrics', {
      body: { symbol }
    });

    console.log('Finnhub Service: Edge function response - data:', data, 'error:', error);

    if (error) {
      console.error('Finnhub Service: Supabase function error:', error);
      throw new Error(`Supabase function error: ${error.message}`);
    }

    if (!data) {
      console.warn('Finnhub Service: No data returned from edge function');
      return {};
    }

    console.log('Finnhub Service: Received data from edge function:', data);
    return data;

  } catch (error) {
    console.error('Finnhub Service: Error calling edge function:', error);
    throw error;
  }
};