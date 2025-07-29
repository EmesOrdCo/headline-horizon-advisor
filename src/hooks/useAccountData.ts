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
  const { getAccounts, getAccount, getPositions, loading, error } = useAlpacaBroker();
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadAccounts = async () => {
    try {
      console.log('Loading accounts...');
      const accountsData = await getAccounts();
      console.log('Raw accounts data:', accountsData);
      setAccounts(accountsData);
      
      // Get user's account number from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('alpaca_account_number')
          .eq('id', user.id)
          .single();
        
        let targetAccount = null;
        if (profile?.alpaca_account_number) {
          targetAccount = accountsData.find(acc => 
            acc.account_number === profile.alpaca_account_number
          );
          console.log('Found account by profile:', targetAccount);
        }
        
        // Fallback to first account if no specific account found
        if (!targetAccount && accountsData.length > 0) {
          targetAccount = accountsData[0];
          console.log('Using first account as fallback:', targetAccount);
        }
        
        if (targetAccount) {
          // Get detailed account information
          console.log('Getting detailed account info for:', targetAccount.id);
          try {
            const detailedAccount = await getAccount(targetAccount.id);
            console.log('Detailed account data:', detailedAccount);
            setSelectedAccount(detailedAccount || targetAccount);
          } catch (detailError) {
            console.error('Failed to get detailed account, using basic:', detailError);
            setSelectedAccount(targetAccount);
          }
        } else {
          setSelectedAccount(null);
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
    // Use equity field, falling back to last_equity from basic account data
    totalValue: selectedAccount?.equity 
      ? parseFloat(selectedAccount.equity) 
      : selectedAccount?.last_equity 
        ? parseFloat(selectedAccount.last_equity) 
        : 0,
    
    // Use cash field, falling back to buying_power 
    availableCash: selectedAccount?.cash 
      ? parseFloat(selectedAccount.cash) 
      : selectedAccount?.buying_power 
        ? parseFloat(selectedAccount.buying_power) 
        : 0,
    
    // Calculate invested amount as total value minus available cash
    investedAmount: (() => {
      const totalVal = selectedAccount?.equity 
        ? parseFloat(selectedAccount.equity) 
        : selectedAccount?.last_equity 
          ? parseFloat(selectedAccount.last_equity) 
          : 0;
      const availCash = selectedAccount?.cash 
        ? parseFloat(selectedAccount.cash) 
        : selectedAccount?.buying_power 
          ? parseFloat(selectedAccount.buying_power) 
          : 0;
      return Math.max(0, totalVal - availCash);
    })(),
    
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