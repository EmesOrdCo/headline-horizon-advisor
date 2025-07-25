import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchMagnificent7 } from '@/hooks/useMagnificent7';
import { useFetchIndexFunds } from '@/hooks/useIndexFunds';
import { useFetchRSSNews } from '@/hooks/useRSSHeadlines';
import { useRefreshControl } from '@/contexts/RefreshContext';

const AutoRefreshAnalytics = () => {
  const queryClient = useQueryClient();
  const fetchMagnificent7 = useFetchMagnificent7();
  const fetchIndexFunds = useFetchIndexFunds();
  const fetchRSSNews = useFetchRSSNews();
  const { isRefreshPaused } = useRefreshControl();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performAllAnalyses = async () => {
      if (isRefreshPaused) {
        console.log('🚫 Auto-refresh skipped - globally paused');
        return;
      }

      console.log('🔄 Auto-refreshing all analytics...');
      
      try {
        // Run all analyses in parallel
        const [mag7Result, indexResult, rssResult] = await Promise.allSettled([
          fetchMagnificent7(),
          fetchIndexFunds(),
          fetchRSSNews()
        ]);

        // Log results
        if (mag7Result.status === 'fulfilled' && mag7Result.value.success) {
          console.log('✅ Magnificent 7 analysis refreshed successfully');
          await queryClient.invalidateQueries({ queryKey: ['magnificent-7-articles'] });
        } else {
          console.error('❌ Magnificent 7 analysis failed:', mag7Result);
        }

        if (indexResult.status === 'fulfilled' && indexResult.value.success) {
          console.log('✅ Index Funds analysis refreshed successfully');
          await queryClient.invalidateQueries({ queryKey: ['index-funds-articles'] });
        } else {
          console.error('❌ Index Funds analysis failed:', indexResult);
        }

        if (rssResult.status === 'fulfilled' && rssResult.value.success) {
          console.log('✅ RSS headlines refreshed successfully');
          await queryClient.invalidateQueries({ queryKey: ['rss-headlines'] });
        } else {
          console.error('❌ RSS headlines refresh failed:', rssResult);
        }

      } catch (error) {
        console.error('❌ Error during auto-refresh:', error);
      }
    };

    // Clean up existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!isRefreshPaused) {
      // Run immediately on mount if not paused
      performAllAnalyses();
      
      // Set up interval to run every 2 minutes (120,000 ms)
      intervalRef.current = setInterval(performAllAnalyses, 2 * 60 * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMagnificent7, fetchIndexFunds, fetchRSSNews, queryClient, isRefreshPaused]);

  return null; // This component doesn't render anything, it just handles auto-refresh
};

export default AutoRefreshAnalytics;