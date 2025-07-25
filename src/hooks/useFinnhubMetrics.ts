import { useState, useEffect } from 'react';
import { fetchFinnhubMetrics, FinnhubMetrics } from '@/services/finnhubService';

export const useFinnhubMetrics = (symbol: string) => {
  const [metrics, setMetrics] = useState<FinnhubMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useFinnhubMetrics: Hook initialized with symbol:', symbol);

  useEffect(() => {
    console.log('useFinnhubMetrics: useEffect triggered with symbol:', symbol);
    
    if (!symbol) {
      console.log('useFinnhubMetrics: No symbol provided, skipping fetch');
      return;
    }

    const loadMetrics = async () => {
      console.log('useFinnhubMetrics: Starting fetch for symbol:', symbol);
      setLoading(true);
      setError(null);
      try {
        console.log('useFinnhubMetrics: Calling fetchFinnhubMetrics...');
        const data = await fetchFinnhubMetrics(symbol);
        console.log('useFinnhubMetrics: Received data:', data);
        setMetrics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial metrics';
        setError(errorMessage);
        console.error('useFinnhubMetrics: Fetch error:', err);
        // Reset to empty state on error to show consistent behavior
        setMetrics({});
      } finally {
        console.log('useFinnhubMetrics: Setting loading to false');
        setLoading(false);
      }
    };

    loadMetrics();
  }, [symbol]);

  console.log('useFinnhubMetrics: Returning:', { metrics, loading, error });
  return { metrics, loading, error };
};