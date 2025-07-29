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
  const { createJournal, loading } = useAlpacaBroker();

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
      console.log('💸 Starting withdrawal simulation...');
      console.log('Account ID:', accountId);
      console.log('Withdrawal amount:', amount);
      
      // Try to use Journal API first
      let alpacaJournalId = null;
      
      try {
        const journalData = {
          from_account: accountId,
          to_account: "alpaca-funding-source", 
          entry_type: "JNLC",
          amount: amount
        };

        console.log('📤 Creating journal entry for withdrawal:', journalData);
        const result = await createJournal(journalData);
        alpacaJournalId = result.id;
        console.log('✅ Journal withdrawal successful:', result);
      } catch (journalError) {
        console.warn('❌ Journal API failed, proceeding with simulation:', journalError);
      }

      // Save the withdrawal record to our database
      const { data: transferRecord, error: dbError } = await supabase
        .from('user_transfers')
        .insert({
          user_id: user.id,
          alpaca_account_id: accountId,
          amount: withdrawalAmount,
          direction: 'OUTGOING',
          status: 'COMPLETE',
          transfer_type: 'JOURNAL',
          reason: `Simulated Withdrawal - $${amount}`,
          alpaca_transfer_id: alpacaJournalId
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
      
      toast.success(`Withdrawal of $${amount} processed successfully`);
      onWithdrawalComplete();
      
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Withdrawal failed');
      setStep('error');
      toast.error('Withdrawal simulation failed');
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
                Simulate Withdrawal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Withdraw funds from your trading account using the Journal API
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
                    <span className="text-gray-900 dark:text-white">Journal Transfer (JNLC)</span>
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
                    Simulate Withdrawal
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
                Processing Withdrawal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Creating journal entry for ${amount} withdrawal...
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Initiating journal transfer</span>
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
                Withdrawal Successful!
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
                  <span>Journal Cash (JNLC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Completed
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
                Withdrawal Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                {errorMessage || 'The withdrawal could not be processed. Please try again.'}
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
          <DialogTitle className="sr-only">Simulate Withdrawal</DialogTitle>
          <DialogDescription className="sr-only">
            Simulate withdrawing funds from your Alpaca trading account
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SimulateWithdrawalModal;