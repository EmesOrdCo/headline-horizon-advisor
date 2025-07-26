
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  Check,
  User,
  FileText,
  Shield,
  Upload,
  Users,
  CreditCard
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OnboardingData {
  // Personal Details
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  countryOfCitizenship: string;
  countryOfBirth: string;
  countryOfTaxResidence: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fundingSource: string[];
  
  // Regulatory Disclosures
  isControlPerson: boolean;
  isAffiliatedExchangeOrFinra: boolean;
  isPoliticallyExposed: boolean;
  immediateFamilyExposed: boolean;
  
  // Agreements (auto-signed)
  agreementsSigned: boolean;
  signedAt: string;
  ipAddress: string;
  
  // Trusted Contact (optional)
  trustedContactFirstName: string;
  trustedContactLastName: string;
  trustedContactEmail: string;
}

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Disclosures', icon: Shield },
  { id: 3, title: 'Agreements', icon: FileText },
  { id: 4, title: 'Documents', icon: Upload },
  { id: 5, title: 'Trusted Contact', icon: Users },
  { id: 6, title: 'Confirmation', icon: Check }
];

const FUNDING_SOURCES = [
  { value: 'employment_income', label: 'Employment Income' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'business_income', label: 'Business Income' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment_income', label: 'Investment Income' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' }
];

const Auth = () => {
  useSEO({
    title: "Sign In or Create Account",
    description: "Access your MarketSensorAI account to get AI-powered market insights and predictions. Sign in or create a new account to start your free trial.",
    canonical: "https://yourdomain.com/auth",
    noindex: true
  });
  
  const [searchParams] = useSearchParams();
  
  // Main flow state
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth fields for sign in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Account creation result
  const [accountResult, setAccountResult] = useState<any>(null);
  
  // Onboarding data
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    dateOfBirth: undefined,
    countryOfCitizenship: 'USA',
    countryOfBirth: 'USA',
    countryOfTaxResidence: 'USA',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    fundingSource: ['employment_income'],
    isControlPerson: false,
    isAffiliatedExchangeOrFinra: false,
    isPoliticallyExposed: false,
    immediateFamilyExposed: false,
    agreementsSigned: false,
    signedAt: '',
    ipAddress: '127.0.0.1',
    trustedContactFirstName: '',
    trustedContactLastName: '',
    trustedContactEmail: ''
  });
  
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

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          onboardingData.firstName &&
          onboardingData.lastName &&
          onboardingData.dateOfBirth &&
          onboardingData.email &&
          onboardingData.phoneNumber &&
          onboardingData.streetAddress &&
          onboardingData.city &&
          onboardingData.state &&
          onboardingData.postalCode &&
          onboardingData.fundingSource.length > 0 &&
          password &&
          password.length >= 6
        );
      case 2:
        return true; // All disclosures have default values
      case 3:
        return onboardingData.agreementsSigned;
      case 4:
        return true; // Documents are simulated in sandbox
      case 5:
        return true; // Trusted contact is optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before proceeding.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      // Step 1: Create Supabase user account
      console.log('Creating Supabase user account...');
      const fullName = `${onboardingData.firstName} ${onboardingData.lastName}`.trim();
      const authResult = await signUp(onboardingData.email, password, fullName);
      
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
          email_address: onboardingData.email.trim(),
          phone_number: onboardingData.phoneNumber.replace(/[^\d]/g, ''),
          street_address: [onboardingData.streetAddress.trim()],
          city: onboardingData.city.trim(),
          state: onboardingData.state.trim(),
          postal_code: onboardingData.postalCode.trim(),
          country: onboardingData.country
        },
        identity: {
          given_name: onboardingData.firstName.trim(),
          family_name: onboardingData.lastName.trim(),
          date_of_birth: onboardingData.dateOfBirth ? format(onboardingData.dateOfBirth, 'yyyy-MM-dd') : '',
          tax_id: '661010666', // Test SSN for sandbox (without dashes)
          tax_id_type: 'USA_SSN',
          country_of_citizenship: onboardingData.countryOfCitizenship,
          country_of_birth: onboardingData.countryOfBirth,
          country_of_tax_residence: onboardingData.countryOfTaxResidence,
          funding_source: onboardingData.fundingSource,
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
          is_control_person: onboardingData.isControlPerson,
          is_affiliated_exchange_or_finra: onboardingData.isAffiliatedExchangeOrFinra,
          is_affiliated_exchange_or_iiroc: false,
          is_politically_exposed: onboardingData.isPoliticallyExposed,
          immediate_family_exposed: onboardingData.immediateFamilyExposed,
          is_discretionary: false
        },
        agreements: [
          {
            agreement: 'margin_agreement',
            signed_at: onboardingData.signedAt,
            ip_address: onboardingData.ipAddress
          },
          {
            agreement: 'account_agreement',
            signed_at: onboardingData.signedAt,
            ip_address: onboardingData.ipAddress
          },
          {
            agreement: 'customer_agreement',
            signed_at: onboardingData.signedAt,
            ip_address: onboardingData.ipAddress
          }
        ],
        ...(onboardingData.trustedContactEmail && {
          trusted_contact: {
            given_name: onboardingData.trustedContactFirstName.trim(),
            family_name: onboardingData.trustedContactLastName.trim(),
            email_address: onboardingData.trustedContactEmail.trim()
          }
        })
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

      setAccountResult(alpacaResult);
      setCurrentStep(6); // Move to confirmation step
      
      toast({
        title: "Account Created Successfully!",
        description: "Your MarketSensorAI account with integrated brokerage is ready.",
      });
    } catch (error) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isCompleted 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : isActive 
                    ? "border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" 
                    : "border-gray-300 text-gray-400 dark:border-slate-600 dark:text-slate-500"
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 text-center",
                isActive ? "text-emerald-600 font-medium" : "text-gray-500 dark:text-slate-400"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
    </div>
  );

  const renderPersonalDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          We need this information to verify your identity and create your brokerage account.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input
            value={onboardingData.firstName}
            onChange={(e) => updateOnboardingData({ firstName: e.target.value })}
            placeholder="Enter first name"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input
            value={onboardingData.lastName}
            onChange={(e) => updateOnboardingData({ lastName: e.target.value })}
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
                !onboardingData.dateOfBirth && "text-muted-foreground"
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {onboardingData.dateOfBirth ? format(onboardingData.dateOfBirth, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={onboardingData.dateOfBirth}
              onSelect={(date) => updateOnboardingData({ dateOfBirth: date })}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Citizenship *</Label>
          <Select 
            value={onboardingData.countryOfCitizenship} 
            onValueChange={(value) => updateOnboardingData({ countryOfCitizenship: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="GBR">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Country of Birth *</Label>
          <Select 
            value={onboardingData.countryOfBirth} 
            onValueChange={(value) => updateOnboardingData({ countryOfBirth: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="GBR">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tax Residence *</Label>
          <Select 
            value={onboardingData.countryOfTaxResidence} 
            onValueChange={(value) => updateOnboardingData({ countryOfTaxResidence: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="GBR">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email Address *</Label>
          <Input
            type="email"
            value={onboardingData.email}
            onChange={(e) => updateOnboardingData({ email: e.target.value })}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label>Phone Number *</Label>
          <Input
            value={onboardingData.phoneNumber}
            onChange={(e) => updateOnboardingData({ phoneNumber: e.target.value })}
            placeholder="(555) 123-4567"
            required
            disabled={loading}
          />
        </div>
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
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Password must be at least 6 characters long
        </p>
      </div>

      <div>
        <Label>Street Address *</Label>
        <Input
          value={onboardingData.streetAddress}
          onChange={(e) => updateOnboardingData({ streetAddress: e.target.value })}
          placeholder="123 Main Street"
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>City *</Label>
          <Input
            value={onboardingData.city}
            onChange={(e) => updateOnboardingData({ city: e.target.value })}
            placeholder="San Francisco"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label>State *</Label>
          <Input
            value={onboardingData.state}
            onChange={(e) => updateOnboardingData({ state: e.target.value })}
            placeholder="CA"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label>ZIP Code *</Label>
          <Input
            value={onboardingData.postalCode}
            onChange={(e) => updateOnboardingData({ postalCode: e.target.value })}
            placeholder="94102"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label>Primary Funding Source *</Label>
        <Select 
          value={onboardingData.fundingSource[0]} 
          onValueChange={(value) => updateOnboardingData({ fundingSource: [value] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select funding source" />
          </SelectTrigger>
          <SelectContent>
            {FUNDING_SOURCES.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderDisclosuresStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Regulatory Disclosures</h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          These questions are required by financial regulations. Please answer truthfully.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-medium">Control Person</Label>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Are you a control person of a publicly traded company?
            </p>
          </div>
          <Switch
            checked={onboardingData.isControlPerson}
            onCheckedChange={(checked) => updateOnboardingData({ isControlPerson: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-medium">Exchange/FINRA Affiliation</Label>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Are you affiliated with a stock exchange or FINRA?
            </p>
          </div>
          <Switch
            checked={onboardingData.isAffiliatedExchangeOrFinra}
            onCheckedChange={(checked) => updateOnboardingData({ isAffiliatedExchangeOrFinra: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-medium">Politically Exposed Person</Label>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Are you a politically exposed person (PEP)?
            </p>
          </div>
          <Switch
            checked={onboardingData.isPoliticallyExposed}
            onCheckedChange={(checked) => updateOnboardingData({ isPoliticallyExposed: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-medium">Family Member PEP</Label>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Do you have an immediate family member who is a PEP?
            </p>
          </div>
          <Switch
            checked={onboardingData.immediateFamilyExposed}
            onCheckedChange={(checked) => updateOnboardingData({ immediateFamilyExposed: checked })}
          />
        </div>
      </div>
    </div>
  );

  const renderAgreementsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Account Agreements</h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          Please review and accept the following agreements to continue.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Margin Agreement</CardTitle>
            <CardDescription>
              This agreement governs margin trading and borrowing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              By signing this agreement, you acknowledge the risks of margin trading and agree to the terms and conditions...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Agreement</CardTitle>
            <CardDescription>
              General terms and conditions for your brokerage account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              This agreement outlines your rights and responsibilities as an account holder...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Agreement</CardTitle>
            <CardDescription>
              Privacy policy and data handling practices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              We are committed to protecting your privacy and handling your data responsibly...
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Switch
            checked={onboardingData.agreementsSigned}
            onCheckedChange={(checked) => {
              updateOnboardingData({ 
                agreementsSigned: checked,
                signedAt: checked ? new Date().toISOString() : ''
              });
            }}
          />
          <Label className="text-sm">
            I have read and agree to all the above agreements
          </Label>
        </div>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Identity Verification</h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          In sandbox mode, document verification is simulated. In production, you would upload actual documents.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              CIP Result Document
            </CardTitle>
            <CardDescription>
              Customer Identification Program verification result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Document Verified (Simulated)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Identity Document
            </CardTitle>
            <CardDescription>
              Government-issued photo ID (passport, driver's license)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Document Uploaded (Simulated)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrustedContactStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Trusted Contact (Optional)</h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          A trusted contact can help protect your account if we have concerns about your well-being.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={onboardingData.trustedContactFirstName}
              onChange={(e) => updateOnboardingData({ trustedContactFirstName: e.target.value })}
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={onboardingData.trustedContactLastName}
              onChange={(e) => updateOnboardingData({ trustedContactLastName: e.target.value })}
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            value={onboardingData.trustedContactEmail}
            onChange={(e) => updateOnboardingData({ trustedContactEmail: e.target.value })}
            placeholder="Enter email address"
            disabled={loading}
          />
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Note:</strong> This step is optional. You can skip it and add a trusted contact later from your account settings.
          </p>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Account Created Successfully!</h2>
        <p className="text-gray-600 dark:text-slate-400">
          Your Alpaca brokerage account has been created and is ready for trading.
        </p>
      </div>

      {accountResult && (
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your new brokerage account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Account Number:</span>
              <span className="font-mono">{accountResult.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                {accountResult.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Equity:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Currency:</span>
              <span>{accountResult.currency}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalDetailsStep();
      case 2:
        return renderDisclosuresStep();
      case 3:
        return renderAgreementsStep();
      case 4:
        return renderDocumentsStep();
      case 5:
        return renderTrustedContactStep();
      case 6:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  if (!isSignUp) {
    // Sign In Form
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
              <p className="text-gray-600 dark:text-slate-400">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
              <div>
                <Label>Email Address</Label>
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
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
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
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step Sign Up Flow
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-lg border border-gray-200 dark:bg-slate-800/50 dark:backdrop-blur dark:border-slate-700 rounded-xl p-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">MarketSensorAI</div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                BETA
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Investment Account
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Complete the steps below to create your MarketSensorAI account with integrated brokerage
            </p>
          </div>

          {renderStepIndicator()}

          <div className="mb-8">
            {renderStepContent()}
          </div>

          {currentStep < 6 && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep === 5 ? (
                <Button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
