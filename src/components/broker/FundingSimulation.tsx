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
  const [fundingType, setFundingType] = useState<'ach' | 'journal' | 'mock'>('journal');
  const [amount, setAmount] = useState('10000');
  
  const { createACHRelationship, createTransfer, createJournal, loading } = useAlpacaBroker();

  const handleMockFunding = async () => {
    if (!accountId) {
      toast.error('Please select an account first');
      return;
    }

    // Simulate a funding process for demonstration purposes
    toast.success(`Mock funding of $${amount} initiated successfully!`);
    toast.success('Note: This is a simulation - real funds are not transferred in sandbox mode');
    onFundingComplete();
  };

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
      console.error('ACH funding error:', error);
      toast.error('ACH funding failed in sandbox. Using mock funding instead...');
      setTimeout(() => {
        handleMockFunding();
      }, 1000);
    }
  };

  const handleJournalFunding = async () => {
    if (!accountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      // Use proper Journal API format with real firm account ID
      const journalData = {
        from_account: "9f39baf5-9891-3ef5-9c6f-4f7c5a672e7c", // Real firm account
        to_account: accountId,
        entry_type: "JNLC",
        amount: amount
      };

      console.log('🚀 JOURNAL TRANSFER DEBUG:');
      console.log('- Account ID:', accountId);
      console.log('- Journal Data:', journalData);
      console.log('- About to call createJournal...');
      
      const result = await createJournal(journalData);
      console.log('✅ Journal transfer result:', result);
      
      toast.success(`Journal transfer of $${amount} completed successfully!`);
      onFundingComplete();
    } catch (error) {
      console.error('Journal funding error:', error);
      toast.error('Journal transfer failed in sandbox. Using mock funding instead...');
      setTimeout(() => {
        handleMockFunding();
      }, 1000);
    }
  };

  const handleFunding = () => {
    if (fundingType === 'ach') {
      handleACHFunding();
    } else if (fundingType === 'journal') {
      handleJournalFunding();
    } else {
      handleMockFunding();
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
            <Select value={fundingType} onValueChange={(value: 'ach' | 'journal' | 'mock') => setFundingType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="journal">🏦 Journal Transfer (Updates Alpaca Database)</SelectItem>
                <SelectItem value="ach">ACH Transfer Simulation</SelectItem>
                <SelectItem value="mock">Mock Funding (Demo Only)</SelectItem>
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
              {fundingType === 'journal' ? 'Journal Transfer' : fundingType === 'ach' ? 'ACH Transfer' : 'Mock Funding'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {fundingType === 'journal' 
                ? 'Journal transfers have limited support in Alpaca sandbox environment. Will fallback to mock if not available.'
                : fundingType === 'ach' 
                ? 'Simulates ACH bank transfer. Creates ACH relationship and transfer request. May fallback to mock in sandbox.'
                : 'Simulates funding process for demonstration purposes. No real money is transferred.'
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