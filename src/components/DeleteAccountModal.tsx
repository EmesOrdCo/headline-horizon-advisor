import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!user || !currentPassword) {
      toast({
        title: 'Missing information',
        description: 'Please enter your current password to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Please type "DELETE" to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);

    try {
      // First verify the current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      });

      if (authError) {
        toast({
          title: 'Authentication failed',
          description: 'Current password is incorrect.',
          variant: 'destructive',
        });
        setIsDeleting(false);
        return;
      }

      // Call the delete account function
      const { error: deleteError } = await supabase.functions.invoke('delete-user-account');

      if (deleteError) {
        console.error('Account deletion error:', deleteError);
        toast({
          title: 'Deletion failed',
          description: deleteError.message || 'Failed to delete your account. Please try again.',
          variant: 'destructive',
        });
        setIsDeleting(false);
        return;
      }

      // Sign out and redirect to home
      await signOut();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });

      navigate('/');
      
    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to delete your account. Please contact support if this continues.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setDeleteConfirmation('');
    setCurrentPassword('');
    setIsDeleting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-red-400 text-lg">Delete Account</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-300 space-y-3">
            <p>
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all associated data including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
              <li>Your profile information</li>
              <li>Your stock watchlists</li>
              <li>Your analysis history</li>
              <li>All personal preferences</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-300">
              Current Password
            </Label>
            <Input
              id="password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              disabled={isDeleting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium text-slate-300">
              Type "DELETE" to confirm
            </Label>
            <Input
              id="confirm"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE here"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              disabled={isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={handleClose}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting || deleteConfirmation !== 'DELETE' || !currentPassword}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountModal;