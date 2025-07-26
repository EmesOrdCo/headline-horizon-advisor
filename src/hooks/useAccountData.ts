import { useState, useEffect } from 'react';
import { useAlpacaBroker, AlpacaAccount, AlpacaPosition } from '@/hooks/useAlpacaBroker';
import { supabase } from '@/integrations/supabase/client';

interface AccountData {
  totalValue: number;
  availableCash: number;
  investedAmount: number;
  isLoading: boolean;
  error: string | null;
  accounts: AlpacaAccount[];
  selectedAccount: AlpacaAccount | null;
  positions: AlpacaPosition[];
}

export const useAccountData = () => {
  const { getAccounts, getPositions, loading, error } = useAlpacaBroker();
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadAccounts = async () => {
    try {
      const accountsData = await getAccounts();
      setAccounts(accountsData);
      
      // Get user's account number from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('alpaca_account_number')
          .eq('id', user.id)
          .single();
        
        if (profile?.alpaca_account_number) {
          const activeAccount = accountsData.find(acc => 
            acc.account_number === profile.alpaca_account_number
          ) || accountsData[0];
          setSelectedAccount(activeAccount || null);
        } else {
          // Fallback to first account if no account number in profile
          setSelectedAccount(accountsData[0] || null);
        }
      } else {
        setSelectedAccount(accountsData[0] || null);
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setIsInitialized(true);
    }
  };

  // Load positions when selectedAccount changes
  const loadPositions = async () => {
    if (selectedAccount) {
      try {
        const positionsData = await getPositions(selectedAccount.id);
        setPositions(positionsData);
      } catch (positionsErr) {
        console.error('Failed to load positions:', positionsErr);
        setPositions([]);
      }
    }
  };

  useEffect(() => {
    loadPositions();
  }, [selectedAccount]);

  useEffect(() => {
    loadAccounts();
  }, []);

  // Refresh data function
  const refreshData = () => {
    loadAccounts();
  };

  const accountData: AccountData = {
    totalValue: selectedAccount?.equity ? parseFloat(selectedAccount.equity) : 0,
    availableCash: selectedAccount?.buying_power ? parseFloat(selectedAccount.buying_power) : 0,
    investedAmount: selectedAccount?.equity && selectedAccount?.buying_power 
      ? parseFloat(selectedAccount.equity) - parseFloat(selectedAccount.buying_power)
      : 0,
    isLoading: loading || !isInitialized,
    error: error,
    accounts,
    selectedAccount,
    positions,
  };

  return {
    ...accountData,
    refreshData,
  };
};