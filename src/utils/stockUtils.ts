
export function getCompanyName(symbol: string): string {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'SPY': 'SPDR S&P 500 ETF',
    'QQQ': 'Invesco QQQ Trust',
    'DIA': 'SPDR Dow Jones Industrial Average ETF'
  };
  return companies[symbol] || `${symbol} Corp.`;
}

export function getMockPrice(symbol: string): number {
  const prices: Record<string, number> = {
    'AAPL': 225.75,
    'MSFT': 441.85,
    'GOOGL': 178.92,
    'AMZN': 215.38,
    'NVDA': 144.75,
    'TSLA': 359.22,
    'META': 598.45,
    'SPY': 592.18,
    'QQQ': 512.33,
    'DIA': 445.67
  };
  return prices[symbol] || Math.random() * 200 + 50;
}

export function getMockMarketCap(symbol: string): string {
  const caps: Record<string, string> = {
    'AAPL': '3.45T',
    'MSFT': '3.28T',
    'GOOGL': '2.15T',
    'AMZN': '1.85T',
    'NVDA': '3.58T',
    'TSLA': '1.12T',
    'META': '1.52T',
    'SPY': 'N/A',
    'QQQ': 'N/A',
    'DIA': 'N/A'
  };
  return caps[symbol] || `${(Math.random() * 500 + 50).toFixed(0)}B`;
}
