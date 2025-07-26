import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

// Default stocks for sandbox mode
const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' }
];

export const useUserStocks = () => {
  return useQuery({
    queryKey: ['user-stocks'],
    queryFn: async (): Promise<UserStock[]> => {
      console.log('Fetching user stocks...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      const { data, error } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stocks:', error);
        throw error;
      }

      // If user has no stocks, return default stocks for sandbox mode
      if (!data || data.length === 0) {
        console.log('No user stocks found, returning default stocks for sandbox mode');
        return DEFAULT_STOCKS.map((stock, index) => ({
          id: `default-${index}`,
          symbol: stock.symbol,
          created_at: new Date().toISOString()
        }));
      }

      console.log('User stocks fetched:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};