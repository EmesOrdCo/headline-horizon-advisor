
import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface StockSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  excludedSymbols: string[];
}

interface StockResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

const StockSearch = ({ value, onValueChange, excludedSymbols }: StockSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search function
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchValue.length >= 1) {
      setSearchTimeout(
        setTimeout(() => {
          searchStocks(searchValue);
        }, 300)
      );
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchValue]);

  const searchStocks = async (query: string) => {
    if (query.length < 1) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-stocks', {
        body: { query }
      });

      if (error) {
        throw error;
      }
      
      // Filter out excluded symbols and limit results
      const filteredResults = (data.result || [])
        .filter((stock: StockResult) => 
          !excludedSymbols.includes(stock.symbol.toUpperCase()) &&
          stock.type === 'Common Stock' // Focus on common stocks
        )
        .slice(0, 50); // Limit to 50 results for performance

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedStock = searchResults.find(stock => stock.symbol === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          {value && selectedStock
            ? `${selectedStock.symbol} - ${selectedStock.description}`
            : value
            ? value
            : "Search for a stock..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-slate-800 border-slate-600" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command className="bg-slate-800">
          <CommandInput
            placeholder="Search stocks by symbol or company name..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span className="ml-2 text-white text-sm">Searching...</span>
              </div>
            )}
            
            {!loading && searchValue.length >= 1 && searchResults.length === 0 && (
              <CommandEmpty>
                <div className="text-slate-400 p-4">
                  {searchValue.length < 1 
                    ? "Start typing to search stocks..." 
                    : "No stocks found. Try a different search term."}
                </div>
              </CommandEmpty>
            )}

            {!loading && searchValue.length < 1 && (
              <div className="text-slate-400 p-4 text-center text-sm">
                Start typing to search through thousands of stocks...
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={stock.symbol}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue.toUpperCase());
                      setOpen(false);
                      setSearchValue("");
                    }}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === stock.symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-slate-400 truncate">{stock.description}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StockSearch;
