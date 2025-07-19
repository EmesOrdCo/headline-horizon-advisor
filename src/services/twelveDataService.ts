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
    const endpoints = [
      `${BASE_URL}/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=1&apikey=${TWELVE_DATA_API_KEY}`
    ];

    console.log('TwelveData API: Using endpoints:', endpoints);

    const [priceRes, quoteRes, timeSeriesRes] = await Promise.allSettled(
      endpoints.map(url => {
        console.log('TwelveData API: Fetching from', url);
        return fetch(url).then(res => {
          console.log('TwelveData API: Response status for', url, ':', res.status);
          return res.json();
        });
      })
    );

    const price = priceRes.status === 'fulfilled' ? priceRes.value : {};
    const quote = quoteRes.status === 'fulfilled' ? quoteRes.value : {};
    const timeSeries = timeSeriesRes.status === 'fulfilled' ? timeSeriesRes.value : {};

    console.log('TwelveData API: Price response:', price);
    console.log('TwelveData API: Quote response:', quote);
    console.log('TwelveData API: TimeSeries response:', timeSeries);

    return {
      // From quote endpoint (most metrics should be here for free plan)
      marketCap: quote.market_cap,
      peRatio: quote.pe_ratio,
      pegRatio: quote.peg_ratio,
      priceToBook: quote.price_to_book_ratio,
      priceToSales: quote.price_to_sales_ratio,
      enterpriseValue: quote.enterprise_value,
      evToRevenue: quote.ev_to_revenue,
      evToEbitda: quote.ev_to_ebitda,
      debtToEquity: quote.debt_to_equity,
      currentRatio: quote.current_ratio,
      quickRatio: quote.quick_ratio,
      returnOnEquity: quote.return_on_equity,
      returnOnAssets: quote.return_on_assets,
      grossMargin: quote.gross_margin,
      operatingMargin: quote.operating_margin,
      netMargin: quote.net_margin,
      beta: quote.beta,
      eps: quote.eps,
      bookValuePerShare: quote.book_value_per_share,
      
      // From quote endpoint for dividends
      dividendYield: quote.dividend_yield,
      dividendPerShare: quote.dividend_per_share,
      
      // Growth metrics (if available)
      revenueGrowth: quote.revenue_growth,
      earningsGrowth: quote.earnings_growth,
    };
  } catch (error) {
    console.error('Error fetching Twelve Data metrics:', error);
    return {};
  }
};