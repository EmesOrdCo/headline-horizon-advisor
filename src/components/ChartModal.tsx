
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HistoricalPriceChart from "@/components/HistoricalPriceChart";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  stockName: string;
}

const ChartModal = ({ isOpen, onClose, symbol, stockName }: ChartModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {symbol} - {stockName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <HistoricalPriceChart symbol={symbol} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;
