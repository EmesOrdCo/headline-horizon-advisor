
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AllDataTabProps {
  symbol: string;
  stockInfo: {
    price: number;
    volume: number;
    marketCap: string;
  };
}

const AllDataTab = ({ symbol, stockInfo }: AllDataTabProps) => {
  return (
    <div className="space-y-6">
      {/* Detailed Financial Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Metrics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Valuation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Price-to-Earnings", value: (Math.random() * 30 + 10).toFixed(2) },
              { label: "Price-to-Book", value: (Math.random() * 5 + 1).toFixed(2) },
              { label: "Price-to-Sales", value: (Math.random() * 10 + 2).toFixed(2) },
              { label: "EV/EBITDA", value: (Math.random() * 20 + 8).toFixed(2) },
              { label: "PEG Ratio", value: (Math.random() * 3 + 0.5).toFixed(2) },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className="text-white font-semibold">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Revenue Growth (YoY)", value: `${(Math.random() * 20 + 5).toFixed(1)}%`, positive: Math.random() > 0.3 },
              { label: "Gross Margin", value: `${(Math.random() * 40 + 20).toFixed(1)}%`, positive: true },
              { label: "Operating Margin", value: `${(Math.random() * 25 + 10).toFixed(1)}%`, positive: Math.random() > 0.2 },
              { label: "Net Margin", value: `${(Math.random() * 20 + 5).toFixed(1)}%`, positive: Math.random() > 0.2 },
              { label: "ROE", value: `${(Math.random() * 25 + 8).toFixed(1)}%`, positive: true },
            ].map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-400">{metric.label}</span>
                <span className={`font-semibold ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Technical Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Technical Analysis</CardTitle>
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
                  <span className="text-white">{(Math.random() * 40 + 30).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MACD</span>
                  <span className="text-emerald-400">Bullish</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MA (50)</span>
                  <span className="text-white">${(stockInfo.price * 0.98).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Market Cap</div>
              <div className="text-white font-bold text-lg">{stockInfo.marketCap}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">P/E Ratio</div>
              <div className="text-white font-bold text-lg">{(Math.random() * 30 + 10).toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">Volume</div>
              <div className="text-white font-bold text-lg">{(stockInfo.volume / 1000000).toFixed(1)}M</div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg text-center">
              <div className="text-slate-400 text-sm mb-1">52W High</div>
              <div className="text-white font-bold text-lg">${(stockInfo.price * 1.25).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDataTab;
