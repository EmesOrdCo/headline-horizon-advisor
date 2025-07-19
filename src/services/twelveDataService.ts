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
    // Try different endpoints that might work with the free plan
    const endpoints = [
      `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/statistics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/profile?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    ];

    console.log('TwelveData API: Using endpoints:', endpoints);

    const responses = await Promise.allSettled(
      endpoints.map(async (url, index) => {
        console.log(`TwelveData API: Fetching from endpoint ${index + 1}:`, url);
        const response = await fetch(url);
        console.log(`TwelveData API: Response status for endpoint ${index + 1}:`, response.status);
        const data = await response.json();
        console.log(`TwelveData API: Response data for endpoint ${index + 1}:`, data);
        return data;
      })
    );

    const [quoteRes, statisticsRes, profileRes] = responses;
    
    const quote = quoteRes.status === 'fulfilled' ? quoteRes.value : {};
    const statistics = statisticsRes.status === 'fulfilled' ? statisticsRes.value : {};
    const profile = profileRes.status === 'fulfilled' ? profileRes.value : {};

    console.log('TwelveData API: Final Quote data:', quote);
    console.log('TwelveData API: Final Statistics data:', statistics);
    console.log('TwelveData API: Final Profile data:', profile);

    // Try to extract data from any available response
    const result = {
      // Try multiple possible field names for each metric
      marketCap: quote.market_cap || statistics.market_capitalization || profile.market_cap,
      peRatio: quote.pe_ratio || quote.pe || statistics.pe_ratio || statistics.pe,
      pegRatio: quote.peg_ratio || quote.peg || statistics.peg_ratio || statistics.peg,
      priceToBook: quote.price_to_book_ratio || quote.pb_ratio || quote.pb || statistics.price_to_book_ratio,
      priceToSales: quote.price_to_sales_ratio || quote.ps_ratio || quote.ps || statistics.price_to_sales_ratio,
      enterpriseValue: quote.enterprise_value || quote.ev || statistics.enterprise_value,
      evToRevenue: quote.ev_to_revenue || quote.ev_revenue || statistics.ev_to_revenue,
      evToEbitda: quote.ev_to_ebitda || quote.ev_ebitda || statistics.ev_to_ebitda,
      debtToEquity: quote.debt_to_equity || quote.debt_equity || statistics.debt_to_equity,
      currentRatio: quote.current_ratio || statistics.current_ratio,
      quickRatio: quote.quick_ratio || statistics.quick_ratio,
      returnOnEquity: quote.return_on_equity || quote.roe || statistics.return_on_equity || statistics.roe,
      returnOnAssets: quote.return_on_assets || quote.roa || statistics.return_on_assets || statistics.roa,
      grossMargin: quote.gross_margin || statistics.gross_margin,
      operatingMargin: quote.operating_margin || statistics.operating_margin,
      netMargin: quote.net_margin || statistics.net_margin,
      beta: quote.beta || statistics.beta || profile.beta,
      eps: quote.eps || quote.earnings_per_share || statistics.eps || statistics.earnings_per_share,
      bookValuePerShare: quote.book_value_per_share || quote.book_value || statistics.book_value_per_share,
      
      // Dividend data
      dividendYield: quote.dividend_yield || quote.dividend_yield_ttm || statistics.dividend_yield,
      dividendPerShare: quote.dividend_per_share || quote.dividend_amount || statistics.dividend_per_share,
      
      // Growth metrics
      revenueGrowth: quote.revenue_growth || statistics.revenue_growth_yoy || statistics.revenue_growth,
      earningsGrowth: quote.earnings_growth || statistics.earnings_growth_yoy || statistics.earnings_growth,
    };

    console.log('TwelveData API: Final processed result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Twelve Data metrics:', error);
    return {};
  }
};