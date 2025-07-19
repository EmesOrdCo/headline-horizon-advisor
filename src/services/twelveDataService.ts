const TWELVE_DATA_API_KEY = 'd12c5dda6916467db5e217091213d315';
const BASE_URL = 'https://api.twelvedata.com';

export interface TwelveDataMetrics {
  // Valuation metrics (Pro/Ultra/Enterprise plans only)
  marketCap?: number;
  peRatio?: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  enterpriseValue?: number;
  evToRevenue?: number;
  evToEbitda?: number;
  
  // Financial health (Pro/Ultra/Enterprise plans only)
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  
  // Dividends (Grow/Pro/Ultra/Enterprise plans only)
  dividendYield?: number;
  dividendPerShare?: number;
  payoutRatio?: number;
  
  // Growth metrics (Pro/Ultra/Enterprise plans only)
  revenueGrowth?: number;
  earningsGrowth?: number;
  
  // Additional metrics (Pro/Ultra/Enterprise plans only)
  beta?: number;
  eps?: number;
  bookValuePerShare?: number;
  
  // Basic price data (Available in FREE plan via /quote endpoint)
  currentPrice?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  previousClose?: number;
  volume?: number;
  averageVolume?: number;
  change?: number;
  percentChange?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekRange?: string;
  exchange?: string;
  currency?: string;
  isMarketOpen?: boolean;
}

export const fetchTwelveDataMetrics = async (symbol: string): Promise<TwelveDataMetrics> => {
  console.log('TwelveData API: Testing free plan endpoints for', symbol);
  try {
    // Test multiple endpoints to see what's available on free plan
    const testEndpoints = [
      `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/eod?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/logo?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/earnings?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/dividends?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/splits?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/insider_transactions?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/income_statement?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/balance_sheet?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/cash_flow?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/statistics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/profile?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    ];

    console.log('TwelveData API: Testing', testEndpoints.length, 'endpoints');

    const responses = await Promise.allSettled(
      testEndpoints.map(async (url, index) => {
        try {
          console.log(`Testing endpoint ${index + 1}: ${url.split('?')[0].split('/').pop()}`);
          const response = await fetch(url);
          const data = await response.json();
          
          const endpointName = url.split('?')[0].split('/').pop();
          console.log(`Endpoint ${endpointName}:`, {
            status: response.status,
            hasError: data.status === 'error' || data.code,
            errorCode: data.code,
            errorMessage: data.message,
            dataKeys: Object.keys(data),
            sampleData: data.status === 'error' ? null : data
          });
          
          return { endpointName, data, error: data.status === 'error' || data.code };
        } catch (error) {
          console.error(`Error testing endpoint ${index + 1}:`, error);
          return { endpointName: 'unknown', data: {}, error: true };
        }
      })
    );

    // Process working endpoints
    const workingEndpoints = responses
      .filter((res): res is PromiseFulfilledResult<{ endpointName: string; data: any; error: any; }> => 
        res.status === 'fulfilled' && !res.value.error)
      .map(res => res.value);
    
    console.log('Working endpoints:', workingEndpoints.map(ep => ep.endpointName));
    
    // Extract data from the quote endpoint (we know this works)
    const quoteResponse = responses.find((res): res is PromiseFulfilledResult<{ endpointName: string; data: any; error: any; }> => 
      res.status === 'fulfilled' && 
      res.value.endpointName === 'quote' && 
      !res.value.error
    );
    
    if (!quoteResponse) {
      console.log('No working quote endpoint found');
      return {};
    }
    
    const quote = quoteResponse.value.data;
    
    // Return what we can extract from available free endpoints
    return {
      // Basic quote data (confirmed available)
      currentPrice: parseFloat(quote.close),
      openPrice: parseFloat(quote.open),
      highPrice: parseFloat(quote.high), 
      lowPrice: parseFloat(quote.low),
      previousClose: parseFloat(quote.previous_close),
      volume: parseFloat(quote.volume),
      averageVolume: parseFloat(quote.average_volume),
      change: parseFloat(quote.change),
      percentChange: parseFloat(quote.percent_change),
      
      // 52-week data
      fiftyTwoWeekHigh: parseFloat(quote.fifty_two_week?.high),
      fiftyTwoWeekLow: parseFloat(quote.fifty_two_week?.low),
      fiftyTwoWeekRange: quote.fifty_two_week?.range,
      
      // Market info
      exchange: quote.exchange,
      currency: quote.currency,
      isMarketOpen: quote.is_market_open,
      
      // Fields not available in free plan (will be undefined)
      marketCap: undefined,
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
      beta: undefined,
      eps: undefined,
      bookValuePerShare: undefined,
      dividendYield: undefined,
      dividendPerShare: undefined,
      payoutRatio: undefined,
      revenueGrowth: undefined,
      earningsGrowth: undefined,
    };
  } catch (error) {
    console.error('Error testing Twelve Data endpoints:', error);
    return {};
  }
};