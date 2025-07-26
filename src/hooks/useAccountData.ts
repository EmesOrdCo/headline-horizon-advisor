import { useState, useEffect } from 'react';
import { useAlpacaBroker, AlpacaAccount, AlpacaPosition } from '@/hooks/useAlpacaBroker';

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
      
      // Always use account number 892602088
      const activeAccount = accountsData.find(acc => 
        acc.account_number === '892602088'
      ) || accountsData[0];
      
      setSelectedAccount(activeAccount || null);
      
      // Load positions for the selected account
      if (activeAccount) {
        try {
          const positionsData = await getPositions(activeAccount.id);
          setPositions(positionsData);
        } catch (positionsErr) {
          console.error('Failed to load positions:', positionsErr);
          setPositions([]);
        }
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setIsInitialized(true);
    }
  };

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