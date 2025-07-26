
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { ArrowLeft, Eye, EyeOff, Calendar as CalendarIcon } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Auth = () => {
  useSEO({
    title: "Sign In or Create Account",
    description: "Access your MarketSensorAI account to get AI-powered market insights and predictions. Sign in or create a new account to start your free trial.",
    canonical: "https://yourdomain.com/auth",
    noindex: true
  });
  
  // Main flow state
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Alpaca fields (only for signup)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const { signUp, signIn, user } = useAuth();
  const { createAccount } = useAlpacaBroker();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateSignUpForm = () => {
    if (!fullName || !email || !password) return false;
    if (!firstName || !lastName || !dateOfBirth) return false;
    if (!phoneNumber || !streetAddress || !city || !state || !postalCode) return false;
    if (password.length < 6) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate all required fields for signup
        if (!validateSignUpForm()) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Step 1: Create Supabase user account
        console.log('Creating Supabase user account...');
        const authResult = await signUp(email, password, fullName);
        
        if (authResult.error) {
          if (authResult.error.message.includes('already registered')) {
            toast({
              title: "Account Already Exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Account Creation Failed",
              description: authResult.error.message,
              variant: "destructive",
            });
          }
          setLoading(false);
          return;
        }

        toast({
          title: "Creating Your Account",
          description: "Setting up your brokerage account...",
        });

        // Wait a moment for the user to be created
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Create Alpaca brokerage account
        console.log('Creating Alpaca brokerage account...');
        const alpacaAccountData = {
          account_type: 'trading' as const,
          contact: {
            email_address: email,
            phone_number: phoneNumber.replace(/[^\d]/g, ''),
            street_address: [streetAddress],
            city: city,
            state: state,
            postal_code: postalCode,
            country: 'USA'
          },
          identity: {
            given_name: firstName,
            family_name: lastName,
            date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '',
            tax_id: '661-010-666', // Test SSN for sandbox
            tax_id_type: 'USA_SSN',
            country_of_citizenship: 'USA',
            country_of_birth: 'USA',
            country_of_tax_residence: 'USA',
            funding_source: ['employment_income'],
            annual_income_min: '50000',
            annual_income_max: '75000',
            total_net_worth_min: '100000',
            total_net_worth_max: '150000',
            liquid_net_worth_min: '50000',
            liquid_net_worth_max: '75000',
            liquidity_needs: 'does_not_matter',
            investment_experience_with_stocks: 'over_5_years',
            investment_experience_with_options: 'over_5_years',
            risk_tolerance: 'conservative',
            investment_objective: 'market_speculation',
            investment_time_horizon: 'more_than_10_years',
            marital_status: 'SINGLE',
            number_of_dependents: 0,
            party_type: 'natural_person'
          },
          disclosures: {
            is_control_person: false,
            is_affiliated_exchange_or_finra: false,
            is_affiliated_exchange_or_iiroc: false,
            is_politically_exposed: false,
            immediate_family_exposed: false,
            is_discretionary: false
          },
          agreements: [
            {
              agreement: 'margin_agreement',
              signed_at: new Date().toISOString(),
              ip_address: '127.0.0.1'
            },
            {
              agreement: 'account_agreement', 
              signed_at: new Date().toISOString(),
              ip_address: '127.0.0.1'
            },
            {
              agreement: 'customer_agreement',
              signed_at: new Date().toISOString(),
              ip_address: '127.0.0.1'
            }
          ]
        };

        const alpacaResult = await createAccount(alpacaAccountData);
        
        if (!alpacaResult) {
          toast({
            title: "Brokerage Account Creation Failed",
            description: "Unable to create your brokerage account. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Step 3: Update user profile with Alpaca data
        console.log('Updating user profile...');
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase
            .from('profiles')
            .update({
              alpaca_account_id: alpacaResult.id,
              alpaca_account_number: alpacaResult.account_number,
              alpaca_account_status: alpacaResult.status,
              alpaca_account_created_at: new Date().toISOString(),
              onboarding_completed: true
            })
            .eq('id', sessionData.session.user.id);
        }

        toast({
          title: "Account Created Successfully!",
          description: "Your MarketSensorAI account with integrated brokerage is ready.",
        });
        
        navigate('/dashboard');
      } else {
        // Sign in flow
        const result = await signIn(email, password);
        if (!result.error) {
          toast({
            title: "Welcome Back",
            description: "You have successfully signed in.",
          });
          navigate('/dashboard');
        } else {
          if (result.error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid Credentials",
              description: "Please check your email and password and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign In Error",
              description: result.error.message,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg border border-gray-200 dark:bg-slate-800/50 dark:backdrop-blur dark:border-slate-700 rounded-xl p-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">MarketSensorAI</div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                BETA
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {isSignUp 
                ? 'Start your free trial and get AI-powered market insights' 
                : 'Sign in to access your dashboard'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Auth Fields */}
            {isSignUp && (
              <div>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Alpaca Required Fields (only for signup) */}
            {isSignUp && (
              <>
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Brokerage Account Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    We'll create your integrated brokerage account automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        defaultMonth={new Date(1990, 0, 1)}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label>Street Address *</Label>
                  <Input
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>ZIP Code *</Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="94102"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-xs text-gray-600 dark:text-slate-400 space-y-1">
                    <p>• This creates both your MarketSensorAI account and integrated brokerage account</p>
                    <p>• Your brokerage account will be created with Alpaca Securities</p>
                    <p>• All fields are required for regulatory compliance</p>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg"
            >
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account & Brokerage' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                disabled={loading}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {isSignUp && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-sm">
                <div className="w-4 h-4 border border-gray-600 dark:border-slate-400 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 dark:bg-slate-400 rounded-sm"></div>
                </div>
                <span>Complete trading platform with AI insights included.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
