
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStock {
  id: string;
  symbol: string;
  created_at: string;
}

export const useUserStocks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stocks', user?.id],
    queryFn: async (): Promise<UserStock[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_stocks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user stocks:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

export const useAddUserStock = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_stocks')
        .insert({ user_id: user.id, symbol });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stocks'] });
    },
  });
};

export const useRemoveUserStock = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (stockId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_stocks')
        .delete()
        .eq('id', stockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stocks'] });
    },
  });
};
