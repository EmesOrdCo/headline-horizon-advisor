
import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  excludedSymbols: string[];
}

// Common stock symbols to show as suggestions
const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "CRM", name: "Salesforce Inc." },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "UBER", name: "Uber Technologies" },
  { symbol: "SPOT", name: "Spotify Technology" },
  { symbol: "SQ", name: "Block Inc." },
  { symbol: "PYPL", name: "PayPal Holdings" },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "SHOP", name: "Shopify Inc." },
  { symbol: "ZM", name: "Zoom Video Communications" },
  { symbol: "ROKU", name: "Roku Inc." },
  { symbol: "SNAP", name: "Snap Inc." },
  { symbol: "BA", name: "Boeing Company" },
  { symbol: "DIS", name: "Walt Disney Company" },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "KO", name: "Coca-Cola Company" },
  { symbol: "PEP", name: "PepsiCo Inc." }
];

const StockSearch = ({ value, onValueChange, excludedSymbols }: StockSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter stocks based on search and exclusions
  const filteredStocks = POPULAR_STOCKS.filter(stock => 
    !excludedSymbols.includes(stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Allow custom symbol entry
  const isCustomSymbol = searchValue.length > 0 && 
    !POPULAR_STOCKS.some(stock => stock.symbol.toLowerCase() === searchValue.toLowerCase()) &&
    !excludedSymbols.includes(searchValue.toUpperCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          {value
            ? POPULAR_STOCKS.find((stock) => stock.symbol === value)?.name || value
            : "Search for a stock..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-slate-800 border-slate-600">
        <Command className="bg-slate-800">
          <CommandInput
            placeholder="Search stocks or enter symbol..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty>
              {isCustomSymbol ? (
                <div className="p-2">
                  <button
                    onClick={() => {
                      onValueChange(searchValue.toUpperCase());
                      setOpen(false);
                      setSearchValue("");
                    }}
                    className="w-full text-left p-2 hover:bg-slate-700 rounded text-white"
                  >
                    Add "{searchValue.toUpperCase()}" as custom stock
                  </button>
                </div>
              ) : (
                <div className="text-slate-400">No stocks found.</div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredStocks.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue.toUpperCase());
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="text-white hover:bg-slate-700"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === stock.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-slate-400">{stock.name}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StockSearch;
