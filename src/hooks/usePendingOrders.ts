import { useState, useEffect } from 'react';
import { useAccountData } from './useAccountData';
import { useAlpacaBroker } from './useAlpacaBroker';

interface PendingOrdersSummary {
  buyOrders: number;
  sellOrders: number;
  totalValue: number;
  orders: any[];
  isLoading: boolean;
  error: string | null;
}

export const usePendingOrders = () => {
  const { selectedAccount } = useAccountData();
  const { getOrders } = useAlpacaBroker();
  const [summary, setSummary] = useState<PendingOrdersSummary>({
    buyOrders: 0,
    sellOrders: 0,
    totalValue: 0,
    orders: [],
    isLoading: false,
    error: null
  });

  const loadPendingOrders = async () => {
    if (!selectedAccount?.id) {
      return;
    }

    setSummary(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch orders with pending statuses
      const allOrders = await getOrders(selectedAccount.id, { 
        status: 'open', 
        limit: 50 
      });
      
      // Filter for pending orders (not filled or cancelled)
      const pendingOrders = allOrders.filter(order => 
        ['new', 'partially_filled', 'pending_new', 'accepted', 'pending_cancel', 'pending_replace'].includes(order.status)
      );
      
      // Calculate summary statistics
      let buyOrders = 0;
      let sellOrders = 0;
      let totalValue = 0;
      
      pendingOrders.forEach(order => {
        if (order.side === 'buy') {
          buyOrders++;
        } else if (order.side === 'sell') {
          sellOrders++;
        }
        
        // Calculate order value based on quantity and limit price
        const qty = parseFloat(order.qty || '0');
        const price = parseFloat(order.limit_price || '0');
        totalValue += qty * price;
      });
      
      setSummary({
        buyOrders,
        sellOrders,
        totalValue,
        orders: pendingOrders,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Failed to load pending orders:', error);
      setSummary(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load pending orders'
      }));
    }
  };

  useEffect(() => {
    loadPendingOrders();
    
    // Refresh pending orders every 30 seconds
    const interval = setInterval(loadPendingOrders, 30000);
    
    return () => clearInterval(interval);
  }, [selectedAccount?.id]);

  return {
    ...summary,
    refreshPendingOrders: loadPendingOrders
  };
};