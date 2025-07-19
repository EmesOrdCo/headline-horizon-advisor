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
  console.log('Finnhub API: Starting fetch for symbol:', symbol);
  
  try {
    // Test individual endpoints to see which ones work
    const metricsUrl = `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`;
    console.log('Finnhub API: Fetching metrics URL:', metricsUrl);
    
    const metricsResponse = await fetch(metricsUrl);
    console.log('Finnhub API: Metrics response status:', metricsResponse.status);
    
    if (!metricsResponse.ok) {
      console.error('Finnhub API: Failed to fetch metrics. Status:', metricsResponse.status);
      const errorText = await metricsResponse.text();
      console.error('Finnhub API: Error response:', errorText);
      return {};
    }
    
    const metricsData = await metricsResponse.json();
    console.log('Finnhub API: Raw metrics data:', metricsData);
    
    // Check if we got valid data
    if (!metricsData || Object.keys(metricsData).length === 0) {
      console.warn('Finnhub API: No metrics data received');
      return {};
    }

    // Extract metrics from the response
    const metric = metricsData.metric || {};
    console.log('Finnhub API: Parsed metric object:', metric);
    
    // Try to get company profile separately
    let marketCap = null;
    try {
      const profileUrl = `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      console.log('Finnhub API: Fetching profile URL:', profileUrl);
      const profileResponse = await fetch(profileUrl);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Finnhub API: Profile data:', profileData);
        marketCap = profileData.marketCapitalization;
      }
    } catch (profileError) {
      console.warn('Finnhub API: Failed to fetch profile data:', profileError);
    }
    
    const result = {
      // Valuation metrics
      marketCap: marketCap,
      peRatio: metric.peBasicExclExtraTTM || metric.peTTM || metric.peAnnual,
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
    
    console.log('Finnhub API: Final result:', result);
    return result;
    
  } catch (error) {
    console.error('Finnhub API: Fetch error:', error);
    return {};
  }
};