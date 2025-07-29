import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SimulateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountNumber: string;
  availableCash: number;
  onWithdrawalComplete: () => void;
}

const SimulateWithdrawalModal = ({ 
  isOpen, 
  onClose, 
  accountId, 
  accountNumber, 
  availableCash,
  onWithdrawalComplete 
}: SimulateWithdrawalModalProps) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [amount, setAmount] = useState('100.00');
  const [journalId, setJournalId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { user } = useAuth();
  const { createTransfer, createACHRelationship, loading } = useAlpacaBroker();

  const resetForm = () => {
    setStep('form');
    setAmount('100.00');
    setJournalId(null);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to make withdrawals');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    
    if (!amount || withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > availableCash) {
      toast.error(`Insufficient funds. Available: $${availableCash.toFixed(2)}`);
      return;
    }

    setStep('processing');

    try {
      console.log('💸 Starting ACH withdrawal...');
      console.log('Account ID:', accountId);
      console.log('Withdrawal amount:', amount);
      
      // Step 1: Create ACH relationship if needed (for sandbox testing)
      let achRelationshipId = null;
      try {
        const achData = {
          account_owner_name: 'Demo User',
          bank_account_type: 'CHECKING',
          bank_account_number: '123456789',
          bank_routing_number: '021000021',
          nickname: 'External Bank Account',
          plaid_processor_token: null,
          default: true
        };
        
        const achResult = await createACHRelationship(accountId, achData);
        achRelationshipId = achResult.id || 'sandbox_ach_' + Date.now();
        console.log('✅ ACH relationship created:', achResult);
      } catch (achError) {
        console.warn('❌ ACH relationship creation failed, using fallback ID:', achError);
        achRelationshipId = 'sandbox_ach_' + Date.now();
      }

      // Step 2: Create ACH withdrawal transfer
      const transferData = {
        relationship_id: achRelationshipId,
        amount: amount,
        direction: 'OUTGOING', // This is the key difference from deposits!
        transfer_type: 'ACH',
        reason: `Withdrawal to external bank account - $${amount}`
      };

      console.log('📤 Creating ACH withdrawal transfer:', transferData);
      const transferResult = await createTransfer(accountId, transferData);
      console.log('✅ ACH withdrawal successful:', transferResult);

      // Save the withdrawal record to our database
      const { data: transferRecord, error: dbError } = await supabase
        .from('user_transfers')
        .insert({
          user_id: user.id,
          alpaca_account_id: accountId,
          amount: withdrawalAmount,
          direction: 'OUTGOING',
          status: transferResult.status || 'PENDING',
          transfer_type: 'ACH',
          reason: `ACH Withdrawal - $${amount}`,
          alpaca_transfer_id: transferResult.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save withdrawal record');
      }

      console.log('✅ Withdrawal saved to database:', transferRecord);
      
      setJournalId(transferRecord.id);
      setStep('success');
      
      toast.success(`ACH withdrawal of $${amount} initiated successfully`);
      onWithdrawalComplete();
      
    } catch (error) {
      console.error('❌ ACH withdrawal failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'ACH withdrawal failed');
      setStep('error');
      toast.error('ACH withdrawal failed');
    }
  };

  const getStatusIcon = () => {
    switch (step) {
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <TrendingDown className="h-8 w-8 text-red-500" />;
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'form':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ACH Withdrawal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Withdraw funds via ACH transfer to your external bank account
              </p>
            </div>

            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Available Balance: ${availableCash.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawal-amount" className="text-sm font-medium">
                  Withdrawal Amount (USD)
                </Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={availableCash}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                  placeholder="100.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum withdrawal: ${availableCash.toFixed(2)}
                </p>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-800 dark:text-blue-300">
                    Withdrawal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">From Account:</span>
                    <span className="font-mono text-xs">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">To:</span>
                    <span className="text-gray-900 dark:text-white">External Bank Account</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Method:</span>
                    <span className="text-gray-900 dark:text-white">ACH Transfer</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableCash}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Start ACH Withdrawal
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                Processing ACH Withdrawal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Creating ACH transfer for ${amount} withdrawal...
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Initiating ACH transfer</span>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mt-4">
                ACH Withdrawal Initiated!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${amount} has been withdrawn from your account
              </p>
            </div>

            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Journal ID:</span>
                  <span className="font-mono text-xs">{journalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">-${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span>ACH Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Processing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mt-4">
                ACH Withdrawal Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                {errorMessage || 'The ACH withdrawal could not be processed. Please try again.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep('form')} 
                variant="outline" 
                className="flex-1"
              >
                Try Again
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">ACH Withdrawal</DialogTitle>
          <DialogDescription className="sr-only">
            Withdraw funds from your Alpaca trading account via ACH transfer
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SimulateWithdrawalModal;