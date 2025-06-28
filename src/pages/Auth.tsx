
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Account Created" : "Welcome Back",
          description: isSignUp 
            ? "Please check your email to verify your account." 
            : "You have successfully signed in.",
        });
        if (!isSignUp) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="dark:bg-slate-800/50 bg-white/80 backdrop-blur border dark:border-slate-700 border-slate-200 rounded-xl p-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl font-bold text-emerald-400">StockPredict AI</div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                BETA
              </Badge>
            </div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="dark:text-slate-400 text-slate-600">
              {isSignUp 
                ? 'Start your free trial and get AI-powered market insights' 
                : 'Sign in to access your dashboard'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 rounded-lg dark:text-white text-slate-900 dark:placeholder-slate-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 rounded-lg dark:text-white text-slate-900 dark:placeholder-slate-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 rounded-lg dark:text-white text-slate-900 dark:placeholder-slate-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-12"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-lg"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Start Free Trial' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="dark:text-slate-400 text-slate-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {isSignUp && (
            <div className="mt-6 pt-6 border-t dark:border-slate-700 border-slate-200">
              <div className="flex items-center gap-2 dark:text-slate-400 text-slate-600 text-sm">
                <div className="w-4 h-4 border dark:border-slate-400 border-slate-600 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 dark:bg-slate-400 bg-slate-600 rounded-sm"></div>
                </div>
                <span>7-day free trial. No credit card required.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
