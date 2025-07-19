import { useState, useEffect } from 'react';
import { fetchFinnhubMetrics, FinnhubMetrics } from '@/services/finnhubService';

export const useFinnhubMetrics = (symbol: string) => {
  const [metrics, setMetrics] = useState<FinnhubMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const loadMetrics = async () => {
      console.log('Finnhub: Starting fetch for symbol:', symbol);
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFinnhubMetrics(symbol);
        console.log('Finnhub: Received data:', data);
        setMetrics(data);
      } catch (err) {
        setError('Failed to fetch financial metrics');
        console.error('Finnhub fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [symbol]);

  return { metrics, loading, error };
};