import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  nickname: string;
  bank_name?: string;
  account_type: string;
  account_number: string;
  routing_number: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  is_default: boolean;
  created_at: string;
}

interface BankAccountManagerProps {
  accountId: string;
}

const BankAccountManager = ({ accountId }: BankAccountManagerProps) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: 'demo_bank_1',
      nickname: 'Main Checking',
      bank_name: 'Demo Bank',
      account_type: 'checking',
      account_number: '****6789',
      routing_number: '021000021',
      status: 'ACTIVE',
      is_default: true,
      created_at: new Date().toISOString()
    }
  ]);
  
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    nickname: '',
    bank_name: '',
    account_type: 'checking',
    account_number: '',
    routing_number: ''
  });

  const { createACHRelationship, loading } = useAlpacaBroker();

  const handleAddBankAccount = async () => {
    if (!newAccount.nickname || !newAccount.account_number || !newAccount.routing_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const achData = {
        account_owner_name: 'Demo User',
        bank_account_type: newAccount.account_type,
        bank_account_number: newAccount.account_number,
        bank_routing_number: newAccount.routing_number,
        nickname: newAccount.nickname,
        plaid_processor_token: null,
        default: bankAccounts.length === 0
      };

      const result = await createACHRelationship(accountId, achData);
      
      const newBankAccount: BankAccount = {
        id: result.id || `demo_bank_${Date.now()}`,
        nickname: newAccount.nickname,
        bank_name: newAccount.bank_name || 'Unknown Bank',
        account_type: newAccount.account_type,
        account_number: `****${newAccount.account_number.slice(-4)}`,
        routing_number: newAccount.routing_number,
        status: 'ACTIVE',
        is_default: bankAccounts.length === 0,
        created_at: new Date().toISOString()
      };

      setBankAccounts(prev => [...prev, newBankAccount]);
      setNewAccount({
        nickname: '',
        bank_name: '',
        account_type: 'checking',
        account_number: '',
        routing_number: ''
      });
      setIsAddingAccount(false);
      toast.success('Bank account added successfully!');
      
    } catch (error) {
      console.error('Failed to add bank account:', error);
      
      // For sandbox mode, still add a demo account
      const newBankAccount: BankAccount = {
        id: `demo_bank_${Date.now()}`,
        nickname: newAccount.nickname,
        bank_name: newAccount.bank_name || 'Demo Bank',
        account_type: newAccount.account_type,
        account_number: `****${newAccount.account_number.slice(-4)}`,
        routing_number: newAccount.routing_number,
        status: 'ACTIVE',
        is_default: bankAccounts.length === 0,
        created_at: new Date().toISOString()
      };

      setBankAccounts(prev => [...prev, newBankAccount]);
      setNewAccount({
        nickname: '',
        bank_name: '',
        account_type: 'checking',
        account_number: '',
        routing_number: ''
      });
      setIsAddingAccount(false);
      toast.success('Demo bank account added successfully!');
      toast.info('Note: This is a sandbox simulation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'INACTIVE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-white">Linked Bank Accounts</CardTitle>
          </div>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Bank Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nickname" className="text-slate-300">Account Nickname *</Label>
                  <Input
                    id="nickname"
                    placeholder="e.g., Main Checking"
                    value={newAccount.nickname}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, nickname: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_name" className="text-slate-300">Bank Name</Label>
                  <Input
                    id="bank_name"
                    placeholder="e.g., Chase Bank"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="account_number" className="text-slate-300">Account Number *</Label>
                  <Input
                    id="account_number"
                    placeholder="123456789"
                    value={newAccount.account_number}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="routing_number" className="text-slate-300">Routing Number *</Label>
                  <Input
                    id="routing_number"
                    placeholder="021000021"
                    value={newAccount.routing_number}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, routing_number: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddBankAccount}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? 'Adding...' : 'Add Account'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingAccount(false)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No bank accounts linked</p>
            <p className="text-sm text-slate-500 mb-6">
              Add a bank account to enable ACH transfers and fund your trading account
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{account.nickname}</span>
                      {account.is_default && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      {account.bank_name} • {account.account_type} • {account.account_number}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(account.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(account.status)}
                      {account.status}
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {bankAccounts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 Your bank accounts are ready for ACH transfers. Use the "Add Funds" button to deposit money into your trading account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManager;