import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';

interface BankAccount {
  id: string;
  nickname: string;
  bank_account_type: string;
  status: string;
  created_at: string;
}

interface BankAccountStatusProps {
  accountId: string;
  onAddNewBank: () => void;
}

const BankAccountStatus = ({ accountId, onAddNewBank }: BankAccountStatusProps) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getActivities } = useAlpacaBroker();

  const loadBankAccounts = async () => {
    setIsLoading(true);
    try {
      // Note: In a real implementation, you'd call a get_ach_relationships endpoint
      // For now, we'll simulate this or show a placeholder
      setBankAccounts([]);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      loadBankAccounts();
    }
  }, [accountId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Linked Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Linked Bank Accounts
        </CardTitle>
        <CardDescription>
          Manage your connected bank accounts for transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No bank accounts linked yet
            </p>
            <Button onClick={onAddNewBank} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Link Your First Bank Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{account.nickname}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {account.bank_account_type} Account
                    </div>
                  </div>
                  <Badge variant={account.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {account.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button onClick={onAddNewBank} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountStatus;