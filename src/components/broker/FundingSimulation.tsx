import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlpacaBroker, AlpacaAccount } from '@/hooks/useAlpacaBroker';
import { toast } from 'sonner';

interface FundingSimulationProps {
  accountId: string;
  accountData?: AlpacaAccount;
  onFundingComplete: () => void;
}

const FundingSimulation = ({ accountId, accountData, onFundingComplete }: FundingSimulationProps) => {
  const [fundingType, setFundingType] = useState<'ach' | 'journal'>('journal');
  const [amount, setAmount] = useState('10000');
  
  const { createACHRelationship, createTransfer, createJournal, loading } = useAlpacaBroker();

  const handleACHFunding = async () => {
    if (!accountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      // First create ACH relationship
      const achData = {
        account_owner_name: 'John Doe',
        bank_account_type: 'CHECKING',
        bank_account_number: '123456789',
        bank_routing_number: '021000021',
        nickname: 'Test Bank Account',
      };

      await createACHRelationship(accountId, achData);
      
      // Then create transfer
      const transferData = {
        amount: amount,
        direction: 'INCOMING',
        timing: 'IMMEDIATE',
        fee_payment_method: 'USER',
      };

      await createTransfer(accountId, transferData);
      toast.success(`ACH funding of $${amount} initiated successfully!`);
      onFundingComplete();
    } catch (error) {
      toast.error('Failed to initiate ACH funding');
      console.error('ACH funding error:', error);
    }
  };

  const handleJournalFunding = async () => {
    if (!accountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      const journalData = {
        from_account: 'FIRM_ACCOUNT', // This would be your firm's account ID in real scenario
        to_account: accountId,
        entry_type: 'JNLC',
        amount: amount,
        description: `Test funding for account ${accountData?.account_number}`,
      };

      await createJournal(journalData);
      toast.success(`Journal transfer of $${amount} completed successfully!`);
      onFundingComplete();
    } catch (error) {
      toast.error('Failed to complete journal transfer');
      console.error('Journal funding error:', error);
    }
  };

  const handleFunding = () => {
    if (fundingType === 'ach') {
      handleACHFunding();
    } else {
      handleJournalFunding();
    }
  };

  if (!accountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funding Simulation</CardTitle>
          <CardDescription>Please select an account to simulate funding</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulate Account Funding</CardTitle>
          <CardDescription>
            Add virtual funds to account: {accountData?.account_number}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="funding-type">Funding Method</Label>
            <Select value={fundingType} onValueChange={(value: 'ach' | 'journal') => setFundingType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="journal">Instant Journal Transfer (Recommended)</SelectItem>
                <SelectItem value="ach">ACH Transfer Simulation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              min="1"
              max="1000000"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              {fundingType === 'journal' ? 'Journal Transfer' : 'ACH Transfer'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {fundingType === 'journal' 
                ? 'Instant funding using firm account journal entry. Funds will be available immediately.'
                : 'Simulates ACH bank transfer. Creates ACH relationship and transfer request.'
              }
            </p>
          </div>

          <Button onClick={handleFunding} disabled={loading || !amount}>
            {loading ? 'Processing...' : `Add $${amount} to Account`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Funding Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['1000', '5000', '10000', '25000', '50000', '100000'].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                onClick={() => setAmount(preset)}
                className="text-sm"
              >
                ${preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundingSimulation;