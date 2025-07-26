import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  created_at: string;
  equity?: string;
  account_type?: string;
  trading_type?: string;
  
  // Detailed Trading Metrics
  cash?: string;
  buying_power?: string;
  long_market_value?: string;
  short_market_value?: string;
  position_market_value?: string;
  initial_margin?: string;
  maintenance_margin?: string;
  regt_buying_power?: string;
  dtbp_buying_power?: string;
  daytrading_buying_power?: string;
  effective_buying_power?: string;
  non_marginable_buying_power?: string;
  sma?: string;
  daytrade_count?: number;
  multiplier?: string;
  settled_cash?: string;
  crypto_market_value?: string;
  pending_cash_transfers?: string;
  cash_withdrawable?: string;
  cash_transferable?: string;
  
  // Additional detailed fields from the API
  trade_cash?: string;
  net_liquidation_value?: string;
  accrued_fees?: string;
  pending_reg_t_call?: string;
  pending_maintenance_call?: string;
  pending_federal_call?: string;
  pending_initial_call?: string;
}

export interface AlpacaAsset {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  status: string;
  asset_class: string;
}

export interface AlpacaOrder {
  id: string;
  symbol: string;
  qty: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit';
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
  status: string;
  filled_qty?: string;
  filled_avg_price?: string;
  created_at: string;
  updated_at: string;
  limit_price?: string;
}

export interface AlpacaPosition {
  symbol: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
}

export interface CreateAccountData {
  account_type: 'trading' | 'custodial' | 'donor_advised' | 'ira';
  contact: {
    email_address: string;
    phone_number: string;
    street_address: string[];
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  identity: {
    given_name: string;
    family_name: string;
    date_of_birth: string;
    tax_id: string;
    tax_id_type: string;
    country_of_citizenship: string;
    country_of_birth: string;
    country_of_tax_residence: string;
    funding_source: string[];
    party_type: string;
  };
  disclosures: {
    is_control_person: boolean;
    is_affiliated_exchange_or_finra: boolean;
    is_affiliated_exchange_or_iiroc?: boolean;
    is_politically_exposed: boolean;
    immediate_family_exposed: boolean;
    is_discretionary?: boolean;
  };
  agreements: Array<{
    agreement: string;
    signed_at: string;
    ip_address: string;
  }>;
  trusted_contact?: {
    given_name: string;
    family_name: string;
    email_address: string;
  };
}

export const useAlpacaBroker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callBrokerAPI = async (action: string, account_id?: string, data?: any) => {
    setLoading(true);
    setError(null);

    try {
      console.log('=== CALLING BROKER API ===');
      console.log('Action:', action);
      console.log('Account ID:', account_id);
      console.log('Data:', data);

      const { data: response, error: apiError } = await supabase.functions.invoke('alpaca-broker', {
        body: { action, account_id, data },
      });

      console.log('=== BROKER API RESPONSE ===');
      console.log('Response:', response);
      console.log('API Error:', apiError);

      if (apiError) {
        console.error('Supabase function error:', apiError);
        throw new Error(`API Error: ${apiError.message}`);
      }

      if (!response) {
        throw new Error('No response received from edge function');
      }

      if (!response.success) {
        console.error('Broker API failed:', response);
        throw new Error(response.error || response.details || 'API request failed');
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Account Management
  const createAccount = async (accountData: CreateAccountData) => {
    console.log('useAlpacaBroker: createAccount called with:', JSON.stringify(accountData, null, 2));
    const result = await callBrokerAPI('create_account', undefined, accountData);
    console.log('useAlpacaBroker: createAccount result:', result);
    return result;
  };

  const getAccounts = async (): Promise<AlpacaAccount[]> => {
    return callBrokerAPI('get_accounts');
  };

  const getAccount = async (accountId: string): Promise<AlpacaAccount> => {
    return callBrokerAPI('get_account', accountId);
  };

  // Funding
  const createACHRelationship = async (accountId: string, achData: any) => {
    return callBrokerAPI('create_ach_relationship', accountId, achData);
  };

  const getACHRelationships = async (accountId: string) => {
    return callBrokerAPI('get_ach_relationships', accountId);
  };

  const createTransfer = async (accountId: string, transferData: any) => {
    return callBrokerAPI('create_transfer', accountId, transferData);
  };

  const createJournal = async (journalData: any) => {
    console.log('🏦 useAlpacaBroker: createJournal called with:', journalData);
    return callBrokerAPI('create_journal', undefined, journalData);
  };

  // Assets
  const getAssets = async (filters?: { status?: string; asset_class?: string; exchange?: string }): Promise<AlpacaAsset[]> => {
    return callBrokerAPI('get_assets', undefined, filters);
  };

  // Trading
  const placeOrder = async (accountId: string, orderData: {
    symbol: string;
    qty: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
    limit_price?: string;
  }): Promise<AlpacaOrder> => {
    return callBrokerAPI('place_order', accountId, orderData);
  };

  const getOrders = async (accountId: string, filters?: { status?: string; limit?: number }): Promise<AlpacaOrder[]> => {
    return callBrokerAPI('get_orders', accountId, filters);
  };

  const getPositions = async (accountId: string): Promise<AlpacaPosition[]> => {
    return callBrokerAPI('get_positions', accountId);
  };

  // Activities
  const getActivities = async (accountId: string, filters?: { activity_types?: string; date?: string }) => {
    return callBrokerAPI('get_activities', accountId, filters);
  };

  const getPortfolioHistory = async (accountId: string, options?: { period?: string; timeframe?: string }) => {
    return callBrokerAPI('get_portfolio_history', accountId, options);
  };

  // Market Data
  const getMarketData = async (symbols: string | string[]) => {
    return callBrokerAPI('get_market_data', undefined, { symbols });
  };

  const getHistoricalBars = async (options: {
    symbols: string;
    timeframe: string;
    start?: string;
    end?: string;
    limit?: number;
  }) => {
    return callBrokerAPI('get_historical_bars', undefined, options);
  };

  return {
    loading,
    error,
    // Account Management
    createAccount,
    getAccounts,
    getAccount,
    // Funding
    createACHRelationship,
    getACHRelationships,
    createTransfer,
    createJournal,
    // Assets
    getAssets,
    // Trading
    placeOrder,
    getOrders,
    getPositions,
    // Activities
    getActivities,
    getPortfolioHistory,
    // Market Data
    getMarketData,
    getHistoricalBars,
  };
};