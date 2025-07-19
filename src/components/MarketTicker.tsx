
import { useStockPrices } from "@/hooks/useStockPrices";
import { TrendingUp, TrendingDown } from "lucide-react";

const MarketTicker = () => {
  const { data: stockPrices, isLoading } = useStockPrices();

  // High impact stocks to display in ticker
  const tickerSymbols = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

  if (isLoading) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading market data...</div>
        </div>
      </div>
    );
  }

  const tickerData = tickerSymbols
    .map(symbol => stockPrices?.find(stock => stock.symbol === symbol))
    .filter(Boolean);

  if (tickerData.length === 0) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 py-2">
        <div className="flex items-center justify-center">
          <div className="text-slate-400 text-sm">Market data not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border-b border-slate-700 py-2 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        <div className="flex items-center space-x-8 px-4">
          {tickerData.map((stock) => (
            <div key={stock.symbol} className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-white">{stock.symbol}</span>
              <span className="text-slate-300">${stock.price.toFixed(2)}</span>
              <div className={`flex items-center space-x-1 ${
                stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </span>
                <span>
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
          {/* Duplicate the data for seamless scrolling */}
          {tickerData.map((stock) => (
            <div key={`${stock.symbol}-dup`} className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-white">{stock.symbol}</span>
              <span className="text-slate-300">${stock.price.toFixed(2)}</span>
              <div className={`flex items-center space-x-1 ${
                stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </span>
                <span>
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
