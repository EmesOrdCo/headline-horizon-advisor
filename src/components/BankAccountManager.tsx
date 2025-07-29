import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  nickname: string;
  bank_name?: string;
  account_type: string;
  account_number_last_four: string;
  routing_number: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  is_default: boolean;
  created_at: string;
  alpaca_relationship_id?: string;
}

interface BankAccountManagerProps {
  accountId: string;
}

const BankAccountManager = ({ accountId }: BankAccountManagerProps) => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    nickname: '',
    bank_name: '',
    account_type: 'checking',
    account_number: '',
    routing_number: ''
  });

  const { createACHRelationship, loading } = useAlpacaBroker();

  // Load user's bank accounts from database
  const loadBankAccounts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('alpaca_account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading bank accounts:', error);
        setBankAccounts([]);
        return;
      }

      const formattedAccounts: BankAccount[] = (data || []).map(account => ({
        id: account.id,
        nickname: account.nickname,
        bank_name: account.bank_name,
        account_type: account.account_type,
        account_number_last_four: account.account_number_last_four,
        routing_number: account.routing_number,
        status: account.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
        is_default: account.is_default,
        created_at: account.created_at,
        alpaca_relationship_id: account.alpaca_relationship_id
      }));

      setBankAccounts(formattedAccounts);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, [user, accountId]);

  const handleAddBankAccount = async () => {
    if (!user) {
      toast.error('Please log in to add bank accounts');
      return;
    }

    if (!newAccount.nickname || !newAccount.account_number || !newAccount.routing_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const achData = {
        account_owner_name: user.email || 'User',
        bank_account_type: newAccount.account_type.toUpperCase(),
        bank_account_number: newAccount.account_number,
        bank_routing_number: newAccount.routing_number,
        nickname: newAccount.nickname,
        plaid_processor_token: null,
        default: bankAccounts.length === 0
      };

      // Try to create ACH relationship with Alpaca
      let alpacaRelationshipId: string | undefined;
      try {
        const result = await createACHRelationship(accountId, achData);
        alpacaRelationshipId = result.id;
      } catch (alpacaError) {
        console.warn('Alpaca ACH creation failed, continuing with local storage:', alpacaError);
      }

      // Save to our database
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .insert({
          user_id: user.id,
          alpaca_account_id: accountId,
          nickname: newAccount.nickname,
          bank_name: newAccount.bank_name || 'Unknown Bank',
          account_type: newAccount.account_type,
          account_number_last_four: newAccount.account_number.slice(-4),
          routing_number: newAccount.routing_number,
          status: 'ACTIVE',
          is_default: bankAccounts.length === 0,
          alpaca_relationship_id: alpacaRelationshipId
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to save bank account');
        return;
      }

      // Refresh the list
      await loadBankAccounts();
      
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
      toast.error('Failed to add bank account');
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
    <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-white text-lg">Linked Bank Accounts</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadBankAccounts}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-700/40 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No bank accounts linked</p>
            <p className="text-sm text-slate-500">
              Add a bank account to enable ACH transfers
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-semibold text-lg truncate">{account.nickname}</span>
                        {account.is_default && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs px-2 py-0.5 flex-shrink-0">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm truncate">
                        {account.bank_name} • {account.account_type} • ****{account.account_number_last_four}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(account.status)} px-3 py-1 flex-shrink-0`}>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(account.status)}
                      <span className="font-medium whitespace-nowrap">{account.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {bankAccounts.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-xl">💡</div>
              <p className="text-blue-300 text-sm leading-relaxed">
                Your bank accounts are ready for ACH transfers. Use the "Add Funds" button to deposit money into your trading account.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManager;