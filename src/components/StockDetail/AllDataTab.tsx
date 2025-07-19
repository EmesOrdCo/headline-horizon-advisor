
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTwelveDataMetrics } from "@/hooks/useTwelveDataMetrics";

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
  // Fetch Twelve Data metrics
  const { metrics: twelveDataMetrics, loading: twelveDataLoading } = useTwelveDataMetrics(symbol);
  
  // Calculate available metrics from Alpaca data
  const bidAskSpread = stockInfo.askPrice && stockInfo.bidPrice 
    ? (stockInfo.askPrice - stockInfo.bidPrice).toFixed(4)
    : "TBC";

  const dailyRange = stockInfo.previousClose 
    ? `${Math.min(stockInfo.price, stockInfo.previousClose).toFixed(2)} - ${Math.max(stockInfo.price, stockInfo.previousClose).toFixed(2)}`
    : "TBC";

  // Helper function to format values with Twelve Data styling
  const formatTwelveDataValue = (value: number | undefined, format: 'currency' | 'percentage' | 'number' = 'number', fallback = "TBC") => {
    if (value === undefined || value === null) {
      return <span className="text-slate-400 text-sm italic">{fallback}</span>;
    }
    
    let formattedValue = '';
    if (format === 'currency') {
      formattedValue = `$${value.toFixed(2)}`;
    } else if (format === 'percentage') {
      formattedValue = `${value.toFixed(2)}%`;
    } else {
      formattedValue = value.toFixed(2);
    }
    
    return (
      <span className="text-blue-300 font-medium">
        {formattedValue}
        <Badge variant="outline" className="ml-2 text-xs border-blue-400 text-blue-300">TD</Badge>
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
              Enhanced with Twelve Data API 
              <Badge variant="outline" className="ml-2 text-xs border-blue-400 text-blue-300">TD</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Earnings</span>
              {formatTwelveDataValue(twelveDataMetrics.peRatio)}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Book</span>
              {formatTwelveDataValue(twelveDataMetrics.priceToBook)}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Price-to-Sales</span>
              {formatTwelveDataValue(twelveDataMetrics.priceToSales)}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">EV/EBITDA</span>
              {formatTwelveDataValue(twelveDataMetrics.evToEbitda)}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
              <span className="text-slate-400">PEG Ratio</span>
              {formatTwelveDataValue(twelveDataMetrics.pegRatio)}
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health</CardTitle>
            <p className="text-slate-400 text-sm">
              Enhanced with Twelve Data API 
              <Badge variant="outline" className="ml-2 text-xs border-blue-400 text-blue-300">TD</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Revenue Growth (YoY)</span>
              {formatTwelveDataValue(twelveDataMetrics.revenueGrowth, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Gross Margin</span>
              {formatTwelveDataValue(twelveDataMetrics.grossMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Operating Margin</span>
              {formatTwelveDataValue(twelveDataMetrics.operatingMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Net Margin</span>
              {formatTwelveDataValue(twelveDataMetrics.netMargin, 'percentage')}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
              <span className="text-slate-400">ROE</span>
              {formatTwelveDataValue(twelveDataMetrics.returnOnEquity, 'percentage')}
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
            Enhanced with Twelve Data API 
            <Badge variant="outline" className="ml-2 text-xs border-blue-400 text-blue-300">TD</Badge>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Market Cap</div>
              <div className="text-white font-bold text-lg">
                {twelveDataMetrics.marketCap ? formatTwelveDataValue(twelveDataMetrics.marketCap, 'currency') : <span className="text-slate-400 italic">TBC</span>}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">EPS</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.eps, 'currency')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Beta</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.beta)}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Dividend Yield</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.dividendYield, 'percentage')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Current Ratio</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.currentRatio)}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Debt to Equity</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.debtToEquity)}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">ROA</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.returnOnAssets, 'percentage')}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Book Value/Share</div>
              <div className="text-white font-bold text-lg">
                {formatTwelveDataValue(twelveDataMetrics.bookValuePerShare, 'currency')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDataTab;
