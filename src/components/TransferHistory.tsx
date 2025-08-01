import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Transfer {
  id: string;
  amount: string;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'QUEUED' | 'PENDING' | 'COMPLETE' | 'FAILED';
  created_at: string;
  updated_at?: string;
  transfer_type?: string;
  reason?: string;
  relationship_id?: string;
}

interface TransferHistoryProps {
  accountId: string;
}

const TransferHistory = ({ accountId }: TransferHistoryProps) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      console.log('Loading transfers for account:', accountId);
      
      // Call our dedicated get-transfers edge function
      const { data, error } = await supabase.functions.invoke('get-transfers', {
        body: { account_id: accountId }
      });

      if (error) {
        console.error('Transfer function error:', error);
        setTransfers([]);
        return;
      }

      console.log('Transfers response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        const transferData = data.data.map((transfer: any) => ({
          id: transfer.id,
          amount: transfer.amount,
          direction: transfer.direction as 'INCOMING' | 'OUTGOING',
          status: transfer.status,
          created_at: transfer.created_at,
          transfer_type: transfer.transfer_type,
          reason: transfer.reason
        }));
        
        console.log('Processed transfers:', transferData);
        setTransfers(transferData);
      } else {
        console.log('No transfer data received');
        setTransfers([]);
      }
    } catch (error) {
      console.error('Failed to load transfer history:', error);
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      loadTransfers();
    }
  }, [accountId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status.toLowerCase() === 'complete' ? 'default' : 
                   status.toLowerCase() === 'failed' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'INCOMING' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>
              Recent deposits and withdrawals to your account
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadTransfers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transfer history found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Transfers will appear here once you make your first deposit
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer, index) => (
              <div key={transfer.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDirectionIcon(transfer.direction)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          ${Math.abs(parseFloat(transfer.amount)).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {transfer.direction === 'INCOMING' ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transfer.reason || transfer.transfer_type || 'Transfer'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(transfer.status)}
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {transfer.id && (
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    ID: {transfer.id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferHistory;