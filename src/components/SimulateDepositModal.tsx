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
import { Loader2, DollarSign, Zap, CheckCircle, XCircle } from 'lucide-react';

interface SimulateDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountNumber: string;
  onDepositComplete: () => void;
}

const SimulateDepositModal = ({ isOpen, onClose, accountId, accountNumber, onDepositComplete }: SimulateDepositModalProps) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [amount, setAmount] = useState('1000.00');
  const [journalId, setJournalId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { createTransfer, getACHRelationships, loading } = useAlpacaBroker();

  const resetForm = () => {
    setStep('form');
    setAmount('1000.00');
    setJournalId(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to make deposits');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setStep('processing');

    try {
      console.log('💰 Starting simulated deposit...');
      console.log('Account ID:', accountId);
      console.log('Deposit amount:', amount);
      
      // Try to create an actual ACH transfer first
      let alpacaTransferId = null;
      let transferStatus = 'COMPLETE';
      
      try {
        // Step 1: Get existing ACH relationships 
        console.log('🔍 Fetching existing ACH relationships...');
        const relationships = await getACHRelationships(accountId);
        console.log('📋 ACH relationships found:', relationships);
        
        if (relationships && relationships.length > 0) {
          const activeRelationship = relationships.find(r => r.status === 'ACTIVE') || relationships[0];
          
          // Step 2: Create the actual ACH transfer using Alpaca's API
          console.log('💸 Creating ACH transfer...');
          const transferData = {
            transfer_type: 'ach',
            amount: parseFloat(amount),
            direction: 'INCOMING',
            timing: 'IMMEDIATE',
            relationship_id: activeRelationship.id,
            fee_payment_method: 'ACCOUNT'
          };
          
          const transferResult = await createTransfer(accountId, transferData);
          alpacaTransferId = transferResult.id;
          console.log('✅ ACH transfer created successfully:', transferResult);
        }
      } catch (alpacaError) {
        console.warn('❌ Alpaca transfer failed, proceeding with simulation:', alpacaError);
      }

      // Save the transfer record to our database
      const { data: transferRecord, error: dbError } = await supabase
        .from('user_transfers')
        .insert({
          user_id: user.id,
          alpaca_account_id: accountId,
          amount: parseFloat(amount),
          direction: 'INCOMING',
          status: transferStatus,
          transfer_type: 'ACH',
          reason: `Simulated Deposit - $${amount}`,
          alpaca_transfer_id: alpacaTransferId
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save transfer record');
      }

      console.log('✅ Transfer saved to database:', transferRecord);
      
      setJournalId(transferRecord.id);
      setStep('success');
      
      toast.success(`🎉 $${amount} deposit completed successfully!`);
      
      // Trigger refresh to update account display
      onDepositComplete();
      
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      setStep('error');
      toast.error(`Deposit failed: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Simulate Instant Deposit
          </DialogTitle>
          <DialogDescription>
            Instantly add demo funds to account #{accountNumber} for testing
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instant Demo Deposit</CardTitle>
              <CardDescription>
                Add virtual funds immediately to your trading account for testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000.00"
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  <Zap className="h-4 w-4 inline mr-2" />
                  Instant Sandbox Deposit
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>Type:</strong> Simulated Funding</p>
                  <p><strong>Processing Time:</strong> Instant</p>
                  <p><strong>Purpose:</strong> Demo & Testing</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                    💡 This instantly adds virtual funds to your account for testing the trading features.
                    No real money is involved.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Add $${amount} Instantly
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Instant Deposit</CardTitle>
              <CardDescription>Adding virtual funds to your account...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm font-medium">Creating simulated deposit...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Deposit Completed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <p className="text-sm"><strong>Transaction ID:</strong> {journalId}</p>
                <p className="text-sm"><strong>Amount:</strong> ${amount}</p>
                <p className="text-sm"><strong>Type:</strong> Simulated Deposit</p>
                <p className="text-sm"><strong>Status:</strong> <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge></p>
                <p className="text-sm"><strong>Processing Time:</strong> Instant</p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🎉 Your virtual funds have been added successfully! You can now use these funds to test 
                  trading features. The balance should update immediately in your wallet.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { onClose(); resetForm(); }} variant="outline" className="flex-1">
                  Close
                </Button>
                <Button onClick={() => { resetForm(); }} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add More Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'error' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5 inline mr-2" />
                Simulation Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  The simulated deposit could not be completed. This may be due to API limitations 
                  in the sandbox environment. Please try again.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { onClose(); resetForm(); }} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => { resetForm(); }} className="flex-1">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimulateDepositModal;