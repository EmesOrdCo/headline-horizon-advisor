
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      // If still loading auth, wait
      if (loading) {
        return;
      }

      // If no user or session, redirect to auth
      if (!user || !session) {
        console.log('No authenticated user, redirecting to auth');
        navigate('/auth');
        return;
      }

      try {
        // Check if profile exists and onboarding is completed
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, alpaca_account_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          // If profile doesn't exist, redirect to auth to complete setup
          if (error.code === 'PGRST116') {
            console.log('Profile not found, redirecting to auth');
            navigate('/auth');
            return;
          }
        }

        // If profile exists but onboarding not completed, redirect to auth
        if (data && !data.onboarding_completed) {
          console.log('Onboarding not completed, redirecting to auth');
          navigate('/auth');
          return;
        }

        setCheckingProfile(false);
      } catch (error) {
        console.error('Error in profile check:', error);
        navigate('/auth');
      }
    };

    checkUserProfile();
  }, [user, session, loading, navigate]);

  if (loading || checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
