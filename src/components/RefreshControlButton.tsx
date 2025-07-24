import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useRefreshControl } from '@/contexts/RefreshContext';

const RefreshControlButton = () => {
  const { isRefreshPaused, pauseRefresh, resumeRefresh } = useRefreshControl();

  const handleToggle = () => {
    if (isRefreshPaused) {
      resumeRefresh();
    } else {
      pauseRefresh();
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isRefreshPaused ? "default" : "secondary"}
      size="sm"
      className={`flex items-center gap-2 ${
        isRefreshPaused 
          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
          : "bg-orange-600 hover:bg-orange-700 text-white"
      }`}
    >
      {isRefreshPaused ? (
        <>
          <Play className="w-4 h-4" />
          Resume Auto-Refresh
        </>
      ) : (
        <>
          <Pause className="w-4 h-4" />
          Pause Auto-Refresh
        </>
      )}
    </Button>
  );
};

export default RefreshControlButton;