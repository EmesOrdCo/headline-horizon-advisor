
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRSSHeadlines, useFetchRSSNews } from "@/hooks/useRSSHeadlines";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const RSSHeadlines = () => {
  const { data: headlines, isLoading, error } = useRSSHeadlines();
  const fetchRSSNews = useFetchRSSNews();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchRSSNews();
      toast({
        title: result.success ? "Headlines Updated" : "Update Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to fetch recent headlines",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-4 sm:p-6 h-[400px] sm:h-[600px] flex flex-col sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Headlines</h3>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Updating...' : 'Refresh'}
        </Button>
      </div>
      
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">
              Failed to load headlines
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {isLoading && !headlines && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400 dark:text-slate-500" />
            <p className="text-gray-600 dark:text-slate-400 text-sm">Loading headlines...</p>
          </div>
        </div>
      )}
      
      {headlines && headlines.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {headlines.slice(0, 15).map((headline, index) => (
              <div 
                key={`${headline.url}-${index}`}
                className="group cursor-pointer border-b border-gray-100 dark:border-slate-700 pb-3 last:border-b-0"
              >
                <a 
                  href={headline.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {headline.title}
                      </h4>
                      {headline.description && (
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {headline.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(headline.published_at)}
                        </div>
                        {headline.category && (
                          <div className="text-xs text-gray-500 dark:text-slate-500">
                            • {headline.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {headlines && headlines.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">
              No recent headlines available
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Refresh Headlines
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSSHeadlines;
