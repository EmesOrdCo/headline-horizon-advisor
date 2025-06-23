
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useFetchNews } from "@/hooks/useNewsData";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const RefreshNewsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fetchNews = useFetchNews();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await fetchNews();
      
      toast({
        title: "News Updated",
        description: `Successfully processed ${result.processed} articles`,
      });
      
      // Refresh the news data
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch latest news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Fetching...' : 'Refresh News'}
    </Button>
  );
};

export default RefreshNewsButton;
