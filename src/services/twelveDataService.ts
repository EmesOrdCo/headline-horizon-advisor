const TWELVE_DATA_API_KEY = 'd12c5dda6916467db5e217091213d315';
const BASE_URL = 'https://api.twelvedata.com';

export interface TwelveDataMetrics {
  // Valuation metrics
  marketCap?: number;
  peRatio?: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  enterpriseValue?: number;
  evToRevenue?: number;
  evToEbitda?: number;
  
  // Financial health
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  
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
}

export const fetchTwelveDataMetrics = async (symbol: string): Promise<TwelveDataMetrics> => {
  console.log('TwelveData API: Fetching metrics for', symbol);
  try {
    // Only use the quote endpoint since it's the only one available on free plan
    const quoteUrl = `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`;
    
    console.log('TwelveData API: Fetching from quote endpoint:', quoteUrl);
    
    const response = await fetch(quoteUrl);
    const data = await response.json();
    
    console.log('TwelveData API: Quote response:', data);
    
    // Check if there's an error in the response
    if (data.status === 'error' || data.code) {
      console.error('TwelveData API Error:', data.message || data);
      return {};
    }
    
    // Extract metrics from the quote response
    const result = {
      // Basic price metrics (available in quote)
      marketCap: parseFloat(data.volume) * parseFloat(data.close), // Rough market cap estimation
      
      // From 52-week data we can calculate some basic metrics
      beta: undefined, // Not available in quote endpoint
      eps: undefined, // Not available in quote endpoint
      
      // We can calculate some basic ratios if we had more fundamental data
      // but these aren't available in the free quote endpoint
      peRatio: undefined,
      pegRatio: undefined,
      priceToBook: undefined,
      priceToSales: undefined,
      enterpriseValue: undefined,
      evToRevenue: undefined,
      evToEbitda: undefined,
      debtToEquity: undefined,
      currentRatio: undefined,
      quickRatio: undefined,
      returnOnEquity: undefined,
      returnOnAssets: undefined,
      grossMargin: undefined,
      operatingMargin: undefined,
      netMargin: undefined,
      bookValuePerShare: undefined,
      dividendYield: undefined,
      dividendPerShare: undefined,
      payoutRatio: undefined,
      revenueGrowth: undefined,
      earningsGrowth: undefined,
      
      // What we can get from quote endpoint:
      currentPrice: parseFloat(data.close),
      volume: parseFloat(data.volume),
      averageVolume: parseFloat(data.average_volume),
      fiftyTwoWeekHigh: parseFloat(data.fifty_two_week?.high),
      fiftyTwoWeekLow: parseFloat(data.fifty_two_week?.low),
      percentChange: parseFloat(data.percent_change),
    };
    
    console.log('TwelveData API: Processed result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Twelve Data metrics:', error);
    return {};
  }
};