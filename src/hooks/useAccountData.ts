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
      
      // Select the first active account with funds
      const activeAccount = accountsData.find(acc => 
        acc.status === 'ACTIVE' && 
        acc.last_equity && 
        parseFloat(acc.last_equity) > 0
      ) || accountsData.find(acc => acc.status === 'ACTIVE') || accountsData[0];
      
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
    totalValue: selectedAccount?.last_equity ? parseFloat(selectedAccount.last_equity) : 0,
    availableCash: selectedAccount?.buying_power ? parseFloat(selectedAccount.buying_power) : 0,
    investedAmount: selectedAccount?.last_equity && selectedAccount?.buying_power 
      ? parseFloat(selectedAccount.last_equity) - parseFloat(selectedAccount.buying_power)
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