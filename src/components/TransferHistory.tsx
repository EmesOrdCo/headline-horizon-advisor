import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';

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
  const { getActivities } = useAlpacaBroker();

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      console.log('Loading transfers for account:', accountId);
      
      // Try multiple activity types to capture all transfer-related activities
      const activityTypes = ['ACATC', 'ACATS', 'CSD', 'CSR', 'DIV', 'DIVNRA', 'DIVCGL', 'DIVCGS', 'DIVFEE', 'DIVFT', 'DIVNRA', 'DIVROC', 'DIVTW', 'DIVTXEX', 'FEE', 'JNLC', 'JNLS', 'MA', 'NC', 'OPASN', 'OPEXP', 'OPXRC', 'PTC', 'PTR', 'REORG', 'SSO', 'SSP'];
      
      let allActivities: any[] = [];
      
      // Try to get general activities first
      try {
        const activities = await getActivities(accountId, { 
          activity_types: 'TRANS,CSD,CSR,JNLC,JNLS,ACATC,ACATS' 
        });
        console.log('Activities response:', activities);
        allActivities = activities || [];
      } catch (activityError) {
        console.log('Activities endpoint failed, trying alternative approach:', activityError);
      }
      
      // If no activities found, try without activity_types filter to get all
      if (allActivities.length === 0) {
        try {
          const allData = await getActivities(accountId, {});
          console.log('All activities response:', allData);
          allActivities = allData || [];
        } catch (allError) {
          console.log('All activities endpoint also failed:', allError);
        }
      }
      
      // Transform activities to transfer format
      const transferData = allActivities
        .filter((activity: any) => {
          // Filter for transfer-related activities
          const isTransfer = activity.activity_type === 'TRANS' || 
                           activity.activity_type === 'CSD' ||  // Cash disbursement
                           activity.activity_type === 'CSR' ||  // Cash receipt
                           activity.activity_type === 'JNLC' || // Journal entry cash
                           activity.activity_type === 'JNLS' || // Journal entry security
                           activity.activity_type === 'ACATC' || // ACATS cash
                           activity.activity_type === 'ACATS' || // ACATS security
                           activity.type === 'ACH' ||
                           activity.type === 'WIRE' ||
                           (activity.side && (activity.side === 'buy' || activity.side === 'sell'));
          
          console.log('Activity:', activity.activity_type, 'isTransfer:', isTransfer);
          return isTransfer;
        })
        .map((activity: any) => {
          const amount = activity.net_amount || activity.qty || activity.amount || '0';
          const numericAmount = parseFloat(amount);
          
          return {
            id: activity.id || activity.transaction_id || `${Date.now()}-${Math.random()}`,
            amount: Math.abs(numericAmount).toString(),
            direction: (numericAmount > 0 ? 'INCOMING' : 'OUTGOING') as 'INCOMING' | 'OUTGOING',
            status: activity.status || 'COMPLETE',
            created_at: activity.transaction_time || activity.activity_time || activity.created_at || new Date().toISOString(),
            transfer_type: activity.activity_type || activity.type || 'Transfer',
            reason: activity.description || activity.activity_type || 'Transfer'
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log('Processed transfer data:', transferData);
      setTransfers(transferData);
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