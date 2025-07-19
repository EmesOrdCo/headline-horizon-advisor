const FINNHUB_API_KEY = 'cs5dq51r01qnhb11a2k0cs5dq51r01qnhb11a2kg';
const BASE_URL = 'https://finnhub.io/api/v1';

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
  console.log('Finnhub API: Fetching metrics for', symbol);
  try {
    // Finnhub endpoints for comprehensive financial data
    const endpoints = [
      `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`,
      `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    ];

    console.log('Finnhub API: Fetching from endpoints:', endpoints);

    const [metricsRes, profileRes, quoteRes] = await Promise.allSettled(
      endpoints.map(async (url, index) => {
        console.log(`Finnhub API: Fetching endpoint ${index + 1}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Finnhub API: Response ${index + 1}:`, data);
        return data;
      })
    );

    const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value : {};
    const profile = profileRes.status === 'fulfilled' ? profileRes.value : {};
    const quote = quoteRes.status === 'fulfilled' ? quoteRes.value : {};

    console.log('Finnhub API: Metrics data:', metrics);
    console.log('Finnhub API: Profile data:', profile);
    console.log('Finnhub API: Quote data:', quote);

    // Extract metrics from Finnhub response
    const metric = metrics.metric || {};
    const annual = metrics.annual || {};
    const ttm = metrics.ttm || {};

    return {
      // Valuation metrics
      marketCap: profile.marketCapitalization,
      peRatio: metric.peBasicExclExtraTTM || metric.peTTM,
      pegRatio: metric.pegRatio,
      priceToBook: metric.pbAnnual || metric.pbTTM,
      priceToSales: metric.psAnnual || metric.psTTM,
      enterpriseValue: metric.enterpriseValue,
      evToEbitda: metric.evToEbitdaTTM,
      
      // Financial health
      currentRatio: metric.currentRatioAnnual || metric.currentRatioTTM,
      quickRatio: metric.quickRatioAnnual || metric.quickRatioTTM,
      returnOnEquity: metric.roeTTM || metric.roeAnnual,
      returnOnAssets: metric.roaTTM || metric.roaAnnual,
      grossMargin: metric.grossMarginTTM || metric.grossMarginAnnual,
      operatingMargin: metric.operatingMarginTTM || metric.operatingMarginAnnual,
      netMargin: metric.netProfitMarginTTM || metric.netProfitMarginAnnual,
      debtToEquity: metric.totalDebtToEquityAnnual || metric.totalDebtToEquityTTM,
      
      // Dividends
      dividendYield: metric.dividendYieldIndicatedAnnual,
      dividendPerShare: metric.dividendPerShareAnnual,
      payoutRatio: metric.payoutRatioAnnual,
      
      // Growth metrics
      revenueGrowth: metric.revenueGrowthTTMYoy,
      earningsGrowth: metric.epsGrowthTTMYoy,
      
      // Additional metrics
      beta: metric.beta,
      eps: metric.epsBasicExclExtraItemsTTM || metric.epsTTM,
      bookValuePerShare: metric.bookValuePerShareAnnual || metric.bookValuePerShareTTM,
      
      // 52-week data
      fiftyTwoWeekHigh: metric['52WeekHigh'],
      fiftyTwoWeekLow: metric['52WeekLow'],
    };
  } catch (error) {
    console.error('Error fetching Finnhub metrics:', error);
    return {};
  }
};