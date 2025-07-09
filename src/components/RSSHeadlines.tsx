
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";
import { useRSSHeadlines } from "@/hooks/useRSSHeadlines";

const RSSHeadlines = () => {
  const { data: headlines, isLoading, error } = useRSSHeadlines();

  // Format publish time to show date and time to the minute
  const formatPublishTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate simple summary for headlines
  const generateSimpleSummary = (item: any) => {
    const description = item.description || '';
    
    // Return first 120 characters of description if available
    if (description.length > 120) {
      return description.substring(0, 120) + '...';
    }
    
    if (description) {
      return description;
    }
    
    // Fallback to a generic summary if no description
    return 'Breaking news covering important market developments and business updates.';
  };

  // Extract source name from URL or use category as fallback
  const getSourceName = (item: any) => {
    if (item.url) {
      try {
        const domain = new URL(item.url).hostname;
        if (domain.includes('reuters')) return 'Reuters';
        if (domain.includes('cnbc')) return 'CNBC';
        if (domain.includes('marketwatch')) return 'MarketWatch';
        return domain.replace('www.', '');
      } catch {
        return item.category || 'Financial News';
      }
    }
    return item.category || 'Financial News';
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl p-6 h-[600px] flex flex-col sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Headlines</h3>
      <div className="text-xs text-gray-500 dark:text-slate-400 mb-3 flex flex-wrap gap-2">
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">Reuters</span>
        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">CNBC</span>
        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">MarketWatch</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-slate-400 py-4">
              Loading headlines...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400 py-4">
              <p>Error loading headlines:</p>
              <p className="text-sm mt-2">{error.message}</p>
              <p className="text-sm mt-2">Click "Refresh News" to try again.</p>
            </div>
          ) : headlines && headlines.length > 0 ? (
            headlines.map((item, index) => (
              <div key={`headline-${item.id}-${index}`} className="bg-gray-50 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex-1"
                  >
                    {item.title}
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0 bg-slate-600/50 hover:bg-slate-600 px-2 py-1 rounded"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <span>{formatPublishTime(item.published_at)}</span>
                  <span className="text-emerald-400">•</span>
                  <span>{getSourceName(item)}</span>
                </div>
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                  <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                    <span className="text-cyan-400 font-medium">Summary:</span> {generateSimpleSummary(item)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 dark:text-slate-400 py-4">
              <p>No headlines available.</p>
              <p className="text-sm mt-2">Click "Refresh News" to load articles.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RSSHeadlines;
