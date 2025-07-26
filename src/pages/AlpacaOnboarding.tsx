import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, CheckCircle, User, FileText, PenTool, Upload, Users, Send, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PersonalDetails {
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
}

interface Disclosures {
  isControlPerson: boolean;
  isAffiliatedExchangeOrFinra: boolean;
  isPoliticallyExposed: boolean;
  immediateFamilyExposed: boolean;
}

interface TrustedContact {
  firstName: string;
  lastName: string;
  email: string;
}

interface AccountResult {
  accountNumber: string;
  status: string;
  id: string;
  equity: string;
}

const steps = [
  { id: 1, title: 'Personal Details', icon: User, description: 'Basic information' },
  { id: 2, title: 'Disclosures', icon: FileText, description: 'Regulatory requirements' },
  { id: 3, title: 'Agreements', icon: PenTool, description: 'Sign documents' },
  { id: 4, title: 'Documents', icon: Upload, description: 'KYC verification' },
  { id: 5, title: 'Trusted Contact', icon: Users, description: 'Emergency contact' },
  { id: 6, title: 'Submit', icon: Send, description: 'Create account' },
];

const countries = [
  'USA', 'GBR', 'CAN', 'AUS', 'DEU', 'FRA', 'JPN', 'ITA', 'ESP', 'NLD', 'CHE', 'SWE', 'NOR', 'DNK'
];

const fundingSources = [
  'employment_income',
  'retirement_income', 
  'investment_income',
  'inheritance',
  'gift',
  'day_trading_profits',
  'other'
];

const AlpacaOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: 'Harry',
    lastName: 'Emes',
    dateOfBirth: new Date(2004, 9, 14), // October 14th, 2004
    countryOfCitizenship: 'USA',
    countryOfBirth: 'USA',
    countryOfTaxResidence: 'USA',
    email: 'harry.emes@worc.ox.ac.uk',
    phoneNumber: '07375827675',
    streetAddress: 'The Plough, Jockey End',
    city: 'Gaddesden Row',
    state: 'CA', // Valid US state for Alpaca API
    postalCode: 'HP2 6HR',
    country: 'USA',
    fundingSource: ['employment_income']
  });
  
  const [disclosures, setDisclosures] = useState<Disclosures>({
    isControlPerson: false,
    isAffiliatedExchangeOrFinra: false,
    isPoliticallyExposed: false,
    immediateFamilyExposed: false
  });

  const [agreementsSigned, setAgreementsSigned] = useState(false);
  const [trustedContact, setTrustedContact] = useState<TrustedContact>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [skipTrustedContact, setSkipTrustedContact] = useState(false);
  const [accountResult, setAccountResult] = useState<AccountResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createAccount, loading } = useAlpacaBroker();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(personalDetails.firstName && 
                 personalDetails.lastName && 
                 personalDetails.dateOfBirth && 
                 personalDetails.email && 
                 personalDetails.phoneNumber && 
                 personalDetails.streetAddress && 
                 personalDetails.city && 
                 personalDetails.state && 
                 personalDetails.postalCode);
      case 2:
        return true; // Disclosures are optional
      case 3:
        return agreementsSigned;
      case 4:
        return true; // Documents are simulated in sandbox
      case 5:
        return skipTrustedContact || !!(trustedContact.firstName && trustedContact.lastName && trustedContact.email);
      default:
        return true;
    }
  }, [personalDetails, agreementsSigned, trustedContact, skipTrustedContact]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitAccount = async () => {
    if (!validateStep(5)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    console.log('=== ACCOUNT CREATION DEBUG ===');
    console.log('Personal Details:', personalDetails);
    console.log('Disclosures:', disclosures);
    console.log('Trusted Contact:', trustedContact);
    
    try {
      const accountData = {
        account_type: 'trading' as const,
        contact: {
          email_address: personalDetails.email,
          phone_number: personalDetails.phoneNumber.replace(/[^\d]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3'), // Format as XXX-XXX-XXXX
          street_address: [personalDetails.streetAddress],
          city: personalDetails.city,
          state: personalDetails.state || 'CA', // Default to CA if no state provided
          postal_code: personalDetails.postalCode,
          country: 'USA' // Force USA for Alpaca API compatibility
        },
        identity: {
          given_name: personalDetails.firstName,
          family_name: personalDetails.lastName,
          date_of_birth: personalDetails.dateOfBirth ? format(personalDetails.dateOfBirth, 'yyyy-MM-dd') : '',
          tax_id: '123456789', // Simulated for sandbox
          tax_id_type: 'USA_SSN',
          country_of_citizenship: 'USA', // Force USA for Alpaca API
          country_of_birth: 'USA', // Force USA for Alpaca API  
          country_of_tax_residence: 'USA', // Force USA for Alpaca API
          funding_source: personalDetails.fundingSource,
          party_type: 'natural_person'
        },
        disclosures: {
          is_control_person: disclosures.isControlPerson,
          is_affiliated_exchange_or_finra: disclosures.isAffiliatedExchangeOrFinra,
          is_affiliated_exchange_or_iiroc: false,
          is_politically_exposed: disclosures.isPoliticallyExposed,
          immediate_family_exposed: disclosures.immediateFamilyExposed,
          is_discretionary: false
        },
        agreements: [
          {
            agreement: 'margin_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1' // Simulated for sandbox
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

      // Add trusted contact if provided
      if (!skipTrustedContact && trustedContact.firstName) {
        (accountData as any).trusted_contact = {
          given_name: trustedContact.firstName,
          family_name: trustedContact.lastName,
          email_address: trustedContact.email
        };
      }

      console.log('Submitting account data:', accountData);
      
      console.log('About to call createAccount...');
      const result = await createAccount(accountData);
      console.log('Account creation result:', result);
      
      if (!result) {
        throw new Error('No result returned from createAccount');
      }
      
      setAccountResult({
        accountNumber: result.account_number || 'PENDING',
        status: result.status || 'APPROVED',
        id: result.id || 'PENDING',
        equity: '0.00'
      });
      
      setCurrentStep(7); // Success step
      
      toast({
        title: "Account Created Successfully!",
        description: `Your Alpaca brokerage account ${result.account_number} has been created.`
      });
      
    } catch (error) {
      console.error('Account creation error:', error);
      
      // Extract meaningful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Detailed error message:', errorMessage);
      
      // Provide specific error message
      let userMessage = "Account creation failed. ";
      if (errorMessage.includes('email')) {
        userMessage += "Please check your email address.";
      } else if (errorMessage.includes('phone')) {
        userMessage += "Please check your phone number format.";
      } else if (errorMessage.includes('tax_id') || errorMessage.includes('ssn')) {
        userMessage += "Please check your Tax ID/SSN.";
      } else if (errorMessage.includes('address')) {
        userMessage += "Please check your address information.";
      } else if (errorMessage.includes('required')) {
        userMessage += "Some required fields are missing.";
      } else {
        userMessage += `Error details: ${errorMessage}`;
      }
      
      toast({
        title: "Account Creation Failed",
        description: userMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={personalDetails.firstName}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={personalDetails.lastName}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
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
                      !personalDetails.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {personalDetails.dateOfBirth ? format(personalDetails.dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={personalDetails.dateOfBirth}
                    onSelect={(date) => setPersonalDetails(prev => ({ ...prev, dateOfBirth: date }))}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    defaultMonth={new Date(1990, 0, 1)}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="citizenship">Country of Citizenship</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  USA (Sandbox Only)
                </div>
              </div>
              <div>
                <Label htmlFor="birthCountry">Country of Birth</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  USA (Sandbox Only)
                </div>
              </div>
              <div>
                <Label htmlFor="taxResidence">Tax Residence</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  USA (Sandbox Only)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={personalDetails.phoneNumber}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={personalDetails.streetAddress}
                onChange={(e) => setPersonalDetails(prev => ({ ...prev, streetAddress: e.target.value }))}
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={personalDetails.city}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={personalDetails.state}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code *</Label>
                <Input
                  id="postal"
                  value={personalDetails.postalCode}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Postal Code"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  USA (Sandbox Only)
                </div>
              </div>
            </div>

            <div>
              <Label>Funding Source</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {fundingSources.map(source => (
                  <div key={source} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={source}
                      checked={personalDetails.fundingSource.includes(source)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPersonalDetails(prev => ({ 
                            ...prev, 
                            fundingSource: [...prev.fundingSource, source] 
                          }));
                        } else {
                          setPersonalDetails(prev => ({ 
                            ...prev, 
                            fundingSource: prev.fundingSource.filter(s => s !== source) 
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={source} className="text-sm capitalize">
                      {source.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                These questions are required by financial regulations. Please answer honestly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Are you a control person?</Label>
                  <p className="text-sm text-muted-foreground">
                    Do you control 10% or more voting shares of any publicly traded company?
                  </p>
                </div>
                <Switch
                  checked={disclosures.isControlPerson}
                  onCheckedChange={(checked) => setDisclosures(prev => ({ ...prev, isControlPerson: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Are you affiliated with a stock exchange or FINRA?</Label>
                  <p className="text-sm text-muted-foreground">
                    Are you employed by or affiliated with any stock exchange or FINRA?
                  </p>
                </div>
                <Switch
                  checked={disclosures.isAffiliatedExchangeOrFinra}
                  onCheckedChange={(checked) => setDisclosures(prev => ({ ...prev, isAffiliatedExchangeOrFinra: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Are you a politically exposed person?</Label>
                  <p className="text-sm text-muted-foreground">
                    Are you or have you been in a prominent public position?
                  </p>
                </div>
                <Switch
                  checked={disclosures.isPoliticallyExposed}
                  onCheckedChange={(checked) => setDisclosures(prev => ({ ...prev, isPoliticallyExposed: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Do you have immediate family who are politically exposed?</Label>
                  <p className="text-sm text-muted-foreground">
                    Are any immediate family members in prominent public positions?
                  </p>
                </div>
                <Switch
                  checked={disclosures.immediateFamilyExposed}
                  onCheckedChange={(checked) => setDisclosures(prev => ({ ...prev, immediateFamilyExposed: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review and Sign Agreements</h3>
              <p className="text-muted-foreground">
                Please review the following agreements before proceeding
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">📄 Customer Agreement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Terms and conditions for your brokerage account
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium">📄 Margin Agreement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Terms for margin trading and borrowing
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium">📄 Account Agreement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  General account terms and service agreement
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agreements"
                  checked={agreementsSigned}
                  onChange={(e) => setAgreementsSigned(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="agreements" className="text-sm">
                  I have read and agree to all the above agreements. I understand that these documents constitute legally binding contracts.
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">KYC Documents</h3>
              <p className="text-muted-foreground">
                Document verification (simulated in sandbox mode)
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">✅ Identity Verification Document</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Passport verification completed</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">✅ CIP Result Document</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Customer identification program completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                📝 In sandbox mode, document verification is automatically completed. 
                In production, you would upload actual identity documents here.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Trusted Contact (Optional)</h3>
              <p className="text-muted-foreground">
                Provide an emergency contact for your account
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="skipContact"
                checked={skipTrustedContact}
                onChange={(e) => setSkipTrustedContact(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="skipContact" className="text-sm">
                Skip this step (not required)
              </label>
            </div>

            {!skipTrustedContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trustedFirstName">First Name</Label>
                    <Input
                      id="trustedFirstName"
                      value={trustedContact.firstName}
                      onChange={(e) => setTrustedContact(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trustedLastName">Last Name</Label>
                    <Input
                      id="trustedLastName"
                      value={trustedContact.lastName}
                      onChange={(e) => setTrustedContact(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="trustedEmail">Email Address</Label>
                  <Input
                    id="trustedEmail"
                    type="email"
                    value={trustedContact.email}
                    onChange={(e) => setTrustedContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">
                Please review your information before creating your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Personal Information</h4>
                <p className="text-sm text-muted-foreground">
                  {personalDetails.firstName} {personalDetails.lastName}<br />
                  {personalDetails.email}<br />
                  {personalDetails.streetAddress}, {personalDetails.city}, {personalDetails.state} {personalDetails.postalCode}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Agreements</h4>
                <p className="text-sm text-muted-foreground">
                  ✅ Customer Agreement<br />
                  ✅ Margin Agreement<br />
                  ✅ Account Agreement
                </p>
              </div>

              {!skipTrustedContact && trustedContact.firstName && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Trusted Contact</h4>
                  <p className="text-sm text-muted-foreground">
                    {trustedContact.firstName} {trustedContact.lastName}<br />
                    {trustedContact.email}
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmitAccount} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Alpaca Account'}
            </Button>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-emerald-600 mb-2">Account Created Successfully!</h3>
              <p className="text-muted-foreground">
                Your Alpaca brokerage account has been created and is ready to use.
              </p>
            </div>

            {accountResult && (
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-medium">{accountResult.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-emerald-600 text-white">{accountResult.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equity:</span>
                    <span className="font-medium">${accountResult.equity}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/broker')} 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Go to Trading Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="absolute top-4 left-4 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Open Your Alpaca Account</h1>
          <p className="text-slate-400">Complete the steps below to create your brokerage account</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isAccessible = currentStep >= step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted ? "bg-emerald-600 border-emerald-600" :
                      isCurrent ? "border-emerald-600 bg-slate-800" :
                      isAccessible ? "border-slate-600 bg-slate-800" :
                      "border-slate-700 bg-slate-900"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <step.icon className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-emerald-600" :
                          isAccessible ? "text-slate-400" :
                          "text-slate-600"
                        )} />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={cn(
                        "text-xs font-medium",
                        isCurrent ? "text-emerald-600" :
                        isCompleted ? "text-emerald-400" :
                        "text-slate-400"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4 mt-5",
                      isCompleted ? "bg-emerald-600" : "bg-slate-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation */}
            {currentStep < 7 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 6 && (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlpacaOnboarding;