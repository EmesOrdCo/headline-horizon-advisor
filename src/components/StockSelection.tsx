
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockSearch from "@/components/StockSearch";
import StockCard from "@/components/StockCard";
import { Loader2 } from "lucide-react";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

interface StockSelectionProps {
  userStocks: UserStock[];
  selectedStock: string;
  onSelectedStockChange: (value: string) => void;
  onAddStock: () => void;
  onRemoveStock: (stockId: string) => void;
  onAnalyzeStocks: () => void;
  analyzing: boolean;
  stockPrices?: StockPrice[];
}

const StockSelection = ({
  userStocks,
  selectedStock,
  onSelectedStockChange,
  onAddStock,
  onRemoveStock,
  onAnalyzeStocks,
  analyzing,
  stockPrices
}: StockSelectionProps) => {
  const getStockPrice = (symbol: string) => {
    return stockPrices?.find(price => price.symbol === symbol);
  };

  return (
    <Card className="mb-8 bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Stock Selection ({userStocks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <StockSearch
              value={selectedStock}
              onValueChange={onSelectedStockChange}
              excludedSymbols={userStocks.map(stock => stock.symbol)}
            />
          </div>
          <Button 
            onClick={onAddStock} 
            disabled={!selectedStock}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Add Stock
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {userStocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              stockPrice={getStockPrice(stock.symbol)}
              onRemove={onRemoveStock}
            />
          ))}
        </div>

        {userStocks.length > 0 && (
          <Button 
            onClick={onAnalyzeStocks} 
            disabled={analyzing}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Stocks'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSelection;
