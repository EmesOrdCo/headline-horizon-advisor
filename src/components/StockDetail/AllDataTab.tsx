import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFinnhubMetrics } from "@/hooks/useFinnhubMetrics";

interface AllDataTabProps {
  symbol: string;
  stockInfo: {
    price: number;
    volume: string | number;
    marketCap: string;
    change: number;
    changePercent: number;
    previousClose: number;
    askPrice: number;
    bidPrice: number;
  };
}

const AllDataTab = ({ symbol, stockInfo }: AllDataTabProps) => {
  console.log('AllDataTab: Component mounted for symbol:', symbol);
  
  // Fetch Finnhub metrics
  const { metrics: finnhubMetrics, loading: finnhubLoading } = useFinnhubMetrics(symbol);
  
  // Calculate available metrics from Alpaca data
  const bidAskSpread = stockInfo.askPrice && stockInfo.bidPrice 
    ? (stockInfo.askPrice - stockInfo.bidPrice).toFixed(4)
    : "TBC";

  const dailyRange = stockInfo.previousClose 
    ? `${Math.min(stockInfo.price, stockInfo.previousClose).toFixed(2)} - ${Math.max(stockInfo.price, stockInfo.previousClose).toFixed(2)}`
    : "TBC";

  // Helper function to format Finnhub values
  const formatFinnhubValue = (value: number | undefined, format: 'currency' | 'percentage' | 'number' | 'ratio' = 'number', fallback = "TBC") => {
    if (value === undefined || value === null || isNaN(value)) {
      return <span className="text-slate-400 text-sm italic">{fallback}</span>;
    }
    
    let formattedValue = '';
    if (format === 'currency') {
      if (value > 1000000000) {
        formattedValue = `$${(value / 1000000000).toFixed(2)}B`;
      } else if (value > 1000000) {
        formattedValue = `$${(value / 1000000).toFixed(2)}M`;
      } else {
        formattedValue = `$${value.toFixed(2)}`;
      }
    } else if (format === 'percentage') {
      formattedValue = `${value.toFixed(2)}%`;
    } else if (format === 'ratio') {
      formattedValue = value.toFixed(2);
    } else {
      formattedValue = value.toLocaleString();
    }
    
    return (
      <span className="text-emerald-300 font-medium">
        {formattedValue}
        <Badge variant="outline" className="ml-2 text-xs border-emerald-400 text-emerald-300">FH</Badge>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Detailed Financial Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Metrics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Valuation Metrics</CardTitle>
            <p className="text-slate-400 text-sm">
              Enhanced with Finnhub API 
              <Badge variant="outline" className="ml-2 text-xs border-emerald-400 text-emerald-300">FH</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Earnings</span>
              {formatFinnhubValue(finnhubMetrics.peRatio, 'ratio')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Book</span>
              {formatFinnhubValue(finnhubMetrics.priceToBook, 'ratio')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Sales</span>
              {formatFinnhubValue(finnhubMetrics.priceToSales, 'ratio')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">EV/EBITDA</span>
              {formatFinnhubValue(finnhubMetrics.evToEbitda, 'ratio')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
              <span className="text-slate-400">PEG Ratio</span>
              {formatFinnhubValue(finnhubMetrics.pegRatio, 'ratio')}
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health</CardTitle>
            <p className="text-slate-400 text-sm">
              Enhanced with Finnhub API 
              <Badge variant="outline" className="ml-2 text-xs border-emerald-400 text-emerald-300">FH</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Revenue Growth (YoY)</span>
              {formatFinnhubValue(finnhubMetrics.revenueGrowth, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Gross Margin</span>
              {formatFinnhubValue(finnhubMetrics.grossMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Operating Margin</span>
              {formatFinnhubValue(finnhubMetrics.operatingMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Net Margin</span>
              {formatFinnhubValue(finnhubMetrics.netMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
              <span className="text-slate-400">ROE</span>
              {formatFinnhubValue(finnhubMetrics.returnOnEquity, 'percentage')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Technical Analysis</CardTitle>
          <p className="text-slate-400 text-sm">Support/resistance calculated from current price; technical indicators require additional data sources</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Support Levels</h4>
              <div className="space-y-1">
                <div className="text-emerald-400">${(stockInfo.price * 0.95).toFixed(2)}</div>
                <div className="text-emerald-400">${(stockInfo.price * 0.90).toFixed(2)}</div>
                <div className="text-emerald-400">${(stockInfo.price * 0.85).toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Resistance Levels</h4>
              <div className="space-y-1">
                <div className="text-red-400">${(stockInfo.price * 1.05).toFixed(2)}</div>
                <div className="text-red-400">${(stockInfo.price * 1.10).toFixed(2)}</div>
                <div className="text-red-400">${(stockInfo.price * 1.15).toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 font-medium">Indicators</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">RSI (14)</span>
                  <span className="text-slate-400 text-sm italic">TBC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MACD</span>
                  <span className="text-slate-400 text-sm italic">TBC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MA (50)</span>
                  <span className="text-slate-400 text-sm italic">TBC</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Market Data */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Market Data (Live from Alpaca API)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Current Price</div>
              <div className="text-white font-bold text-lg">${stockInfo.price.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Daily Change</div>
              <div className={`font-bold text-lg ${stockInfo.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Previous Close</div>
              <div className="text-white font-bold text-lg">${stockInfo.previousClose.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Volume</div>
              <div className="text-slate-400 font-bold text-lg italic">TBC</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Ask Price</div>
              <div className="text-white font-bold text-lg">${stockInfo.askPrice.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Bid Price</div>
              <div className="text-white font-bold text-lg">${stockInfo.bidPrice.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Bid-Ask Spread</div>
              <div className="text-white font-bold text-lg">{bidAskSpread}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Daily Range</div>
              <div className="text-white font-bold text-sm">{dailyRange}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Additional Metrics</CardTitle>
          <p className="text-slate-400 text-sm">
            Enhanced with Finnhub API 
            <Badge variant="outline" className="ml-2 text-xs border-emerald-400 text-emerald-300">FH</Badge>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Market Cap</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.marketCap, 'currency')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">EPS</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.eps, 'currency')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Beta</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.beta, 'ratio')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Dividend Yield</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.dividendYield, 'percentage')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Current Ratio</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.currentRatio, 'ratio')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Debt to Equity</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.debtToEquity, 'ratio')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">ROA</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.returnOnAssets, 'percentage')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Book Value/Share</div>
              <div className="text-white font-bold text-lg">
                {formatFinnhubValue(finnhubMetrics.bookValuePerShare, 'currency')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDataTab;