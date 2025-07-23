import { useState, useEffect } from 'react';
import { fetchAndStoreLogos, CompanyLogo } from '@/services/logoService';

export const useCompanyLogos = (symbols: string[]) => {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const loadLogos = async () => {
      console.log('useCompanyLogos: Loading logos for symbols:', symbols);
      setLoading(true);
      setError(null);
      
      try {
        const fetchedLogos = await fetchAndStoreLogos(symbols);
        console.log('useCompanyLogos: Loaded logos:', fetchedLogos);
        setLogos(fetchedLogos);
      } catch (err) {
        const errorMessage = 'Failed to load company logos';
        setError(errorMessage);
        console.error('useCompanyLogos: Error loading logos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLogos();
  }, [symbols.join(',')]); // Only re-run when symbols change

  const getLogoUrl = (symbol: string): string | null => {
    const logo = logos.find(logo => logo.symbol === symbol);
    return logo?.logo_url || null;
  };

  return { logos, loading, error, getLogoUrl };
};