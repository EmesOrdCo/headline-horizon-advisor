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
  try {
    const endpoints = [
      `${BASE_URL}/statistics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/profile?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
      `${BASE_URL}/dividends?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    ];

    const [statisticsRes, profileRes, dividendsRes] = await Promise.allSettled(
      endpoints.map(url => fetch(url).then(res => res.json()))
    );

    const statistics = statisticsRes.status === 'fulfilled' ? statisticsRes.value : {};
    const profile = profileRes.status === 'fulfilled' ? profileRes.value : {};
    const dividends = dividendsRes.status === 'fulfilled' ? dividendsRes.value : {};

    return {
      // From statistics endpoint
      marketCap: statistics.market_capitalization,
      peRatio: statistics.pe_ratio,
      pegRatio: statistics.peg_ratio,
      priceToBook: statistics.price_to_book_ratio,
      priceToSales: statistics.price_to_sales_ratio,
      enterpriseValue: statistics.enterprise_value,
      evToRevenue: statistics.ev_to_revenue,
      evToEbitda: statistics.ev_to_ebitda,
      debtToEquity: statistics.debt_to_equity,
      currentRatio: statistics.current_ratio,
      quickRatio: statistics.quick_ratio,
      returnOnEquity: statistics.return_on_equity,
      returnOnAssets: statistics.return_on_assets,
      grossMargin: statistics.gross_margin,
      operatingMargin: statistics.operating_margin,
      netMargin: statistics.net_margin,
      beta: statistics.beta,
      eps: statistics.earnings_per_share,
      bookValuePerShare: statistics.book_value_per_share,
      
      // From dividends endpoint
      dividendYield: dividends.yield,
      dividendPerShare: dividends.amount,
      
      // Growth metrics (if available)
      revenueGrowth: statistics.revenue_growth,
      earningsGrowth: statistics.earnings_growth,
    };
  } catch (error) {
    console.error('Error fetching Twelve Data metrics:', error);
    return {};
  }
};