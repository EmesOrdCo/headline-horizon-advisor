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
  const { getAccounts, getPositions, getTradingAccount, loading, error } = useAlpacaBroker();
  const [accounts, setAccounts] = useState<AlpacaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [tradingAccount, setTradingAccount] = useState<any>(null);
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
      
      // Load positions and real-time trading account data for the selected account
      if (activeAccount) {
        try {
          const positionsData = await getPositions(activeAccount.id);
          setPositions(positionsData);
        } catch (positionsErr) {
          console.error('Failed to load positions:', positionsErr);
          setPositions([]);
        }

        // Load real-time trading account data
        try {
          console.log('🔄 Loading real-time trading account data for:', activeAccount.id);
          const tradingAccountData = await getTradingAccount(activeAccount.id);
          console.log('📊 Real-time trading account data:', tradingAccountData);
          setTradingAccount(tradingAccountData);
        } catch (tradingErr) {
          console.error('Failed to load trading account data:', tradingErr);
          setTradingAccount(null);
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
    // Use real-time trading account data if available, fallback to static account data
    totalValue: tradingAccount?.equity ? parseFloat(tradingAccount.equity) : 
                (selectedAccount?.last_equity ? parseFloat(selectedAccount.last_equity) : 0),
    availableCash: tradingAccount?.buying_power ? parseFloat(tradingAccount.buying_power) : 
                   (selectedAccount?.buying_power ? parseFloat(selectedAccount.buying_power) : 0),
    investedAmount: tradingAccount?.equity && tradingAccount?.buying_power 
      ? parseFloat(tradingAccount.equity) - parseFloat(tradingAccount.buying_power)
      : (selectedAccount?.last_equity && selectedAccount?.buying_power 
         ? parseFloat(selectedAccount.last_equity) - parseFloat(selectedAccount.buying_power)
         : 0),
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