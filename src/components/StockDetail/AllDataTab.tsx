
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  // Calculate available metrics from Alpaca data
  const bidAskSpread = stockInfo.askPrice && stockInfo.bidPrice 
    ? (stockInfo.askPrice - stockInfo.bidPrice).toFixed(4)
    : "TBC";

  const dailyRange = stockInfo.previousClose 
    ? `${Math.min(stockInfo.price, stockInfo.previousClose).toFixed(2)} - ${Math.max(stockInfo.price, stockInfo.previousClose).toFixed(2)}`
    : "TBC";

  return (
    <div className="space-y-6">
      {/* Detailed Financial Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Metrics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Valuation Metrics</CardTitle>
            <p className="text-slate-400 text-sm">Fundamental data not available from Alpaca API</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Price-to-Earnings", value: "TBC" },
              { label: "Price-to-Book", value: "TBC" },
              { label: "Price-to-Sales", value: "TBC" },
              { label: "EV/EBITDA", value: "TBC" },
              { label: "PEG Ratio", value: "TBC" },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className="text-slate-400 text-sm italic">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health</CardTitle>
            <p className="text-slate-400 text-sm">Fundamental data not available from Alpaca API</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Revenue Growth (YoY)", value: "TBC" },
              { label: "Gross Margin", value: "TBC" },
              { label: "Operating Margin", value: "TBC" },
              { label: "Net Margin", value: "TBC" },
              { label: "ROE", value: "TBC" },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className="text-slate-400 text-sm italic">{metric.value}</span>
              </div>
            ))}
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

      {/* Additional Metrics - TBC Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Additional Metrics</CardTitle>
          <p className="text-slate-400 text-sm">These metrics require fundamental/historical data not available from Alpaca API</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Market Cap</div>
              <div className="text-slate-400 font-bold text-lg italic">TBC</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">P/E Ratio</div>
              <div className="text-slate-400 font-bold text-lg italic">TBC</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">52W High</div>
              <div className="text-slate-400 font-bold text-lg italic">TBC</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">52W Low</div>
              <div className="text-slate-400 font-bold text-lg italic">TBC</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDataTab;
