import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

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

      console.log('User stocks fetched:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};