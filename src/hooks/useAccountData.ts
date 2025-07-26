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
  const { getAccounts, getPositions, getAccount, loading, error } = useAlpacaBroker();
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
      
      // Load positions and detailed account data for the selected account
      if (activeAccount) {
        try {
          const positionsData = await getPositions(activeAccount.id);
          setPositions(positionsData);
        } catch (positionsErr) {
          console.error('Failed to load positions:', positionsErr);
          setPositions([]);
        }

        // Load detailed account data with real-time equity
        try {
          console.log('🔄 Loading detailed account data for real-time equity:', activeAccount.id);
          const detailedAccountData = await getAccount(activeAccount.id);
          console.log('📊 Detailed account data:', detailedAccountData);
          setTradingAccount(detailedAccountData);
        } catch (accountErr) {
          console.error('Failed to load detailed account data:', accountErr);
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
    // Prioritize real-time equity field over last_equity for accurate real-time values
    totalValue: tradingAccount?.equity ? parseFloat(tradingAccount.equity) : 
                (tradingAccount?.last_equity ? parseFloat(tradingAccount.last_equity) : 
                 (selectedAccount?.equity ? parseFloat(selectedAccount.equity) :
                  (selectedAccount?.last_equity ? parseFloat(selectedAccount.last_equity) : 0))),
    availableCash: tradingAccount?.buying_power ? parseFloat(tradingAccount.buying_power) : 
                   (selectedAccount?.buying_power ? parseFloat(selectedAccount.buying_power) : 0),
    investedAmount: (() => {
      const equity = tradingAccount?.equity ? parseFloat(tradingAccount.equity) : 
                     (tradingAccount?.last_equity ? parseFloat(tradingAccount.last_equity) : 
                      (selectedAccount?.equity ? parseFloat(selectedAccount.equity) :
                       (selectedAccount?.last_equity ? parseFloat(selectedAccount.last_equity) : 0)));
      const buyingPower = tradingAccount?.buying_power ? parseFloat(tradingAccount.buying_power) : 
                          (selectedAccount?.buying_power ? parseFloat(selectedAccount.buying_power) : 0);
      return equity - buyingPower;
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