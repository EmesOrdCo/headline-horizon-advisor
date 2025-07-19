import { useState, useEffect } from 'react';
import { fetchTwelveDataMetrics, TwelveDataMetrics } from '@/services/twelveDataService';

export const useTwelveDataMetrics = (symbol: string) => {
  const [metrics, setMetrics] = useState<TwelveDataMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const loadMetrics = async () => {
      console.log('TwelveData: Starting fetch for symbol:', symbol);
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTwelveDataMetrics(symbol);
        console.log('TwelveData: Received data:', data);
        setMetrics(data);
      } catch (err) {
        setError('Failed to fetch additional metrics');
        console.error('Twelve Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [symbol]);

  return { metrics, loading, error };
};