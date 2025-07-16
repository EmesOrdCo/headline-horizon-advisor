
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Clock } from "lucide-react";
import { useRSSHeadlines, useFetchRSSNews } from "@/hooks/useRSSHeadlines";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const RSSHeadlines = () => {
  const { data: headlines, isLoading, error } = useRSSHeadlines();
  const fetchRSSNews = useFetchRSSNews();
  const queryClient = useQueryClient();

  // Set up automatic refresh every minute
  useEffect(() => {
    const fetchAndRefresh = async () => {
      console.log('🔄 Auto-refreshing RSS headlines...');
      try {
        const result = await fetchRSSNews();
        if (result.success) {
          // Invalidate the query to refetch from database
          await queryClient.invalidateQueries({ queryKey: ['rss-headlines'] });
          console.log('✅ RSS headlines refreshed successfully');
        } else {
          console.error('❌ Failed to refresh RSS headlines:', result.message);
        }
      } catch (error) {
        console.error('❌ Error during RSS refresh:', error);
      }
    };

    // Fetch immediately on mount
    fetchAndRefresh();

    // Set up interval to fetch every minute
    const interval = setInterval(fetchAndRefresh, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchRSSNews, queryClient]);

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const published = new Date(dateString);
      
      // Handle invalid dates
      if (isNaN(published.getTime())) {
        return 'Invalid date';
      }
      
      const diffInMilliseconds = now.getTime() - published.getTime();
      
      // Handle future dates or very small differences (less than 1 minute)
      if (diffInMilliseconds < 60000) {
        return 'Just now';
      }
      
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      }
      
      // For anything older than a week, show the actual date
      return published.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-4 sm:p-6 h-[400px] sm:h-[600px] flex flex-col sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Headlines</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Auto-updating</span>
        </div>
      </div>
      
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load headlines. Retrying automatically...
            </p>
          </div>
        </div>
      )}
      
      {isLoading && !headlines && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
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
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              No recent headlines available. New headlines will appear automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSSHeadlines;
