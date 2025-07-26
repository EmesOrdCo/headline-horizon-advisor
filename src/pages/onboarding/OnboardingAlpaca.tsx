import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAlpacaBroker } from "@/hooks/useAlpacaBroker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OnboardingAlpaca = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    taxId: "",
    annualIncomeMin: "50000",
    annualIncomeMax: "75000",
    totalNetWorthMin: "100000",
    totalNetWorthMax: "150000",
    liquidNetWorthMin: "50000",
    liquidNetWorthMax: "75000",
    liquidityNeeds: "does_not_matter",
    investmentExperienceStocks: "over_5_years",
    investmentExperienceOptions: "over_5_years",
    riskTolerance: "conservative",
    investmentObjective: "market_speculation",
    investmentTimeHorizon: "more_than_10_years",
    maritalStatus: "SINGLE",
    numberOfDependents: "0",
    fundingSource: "employment_income",
    agreed: false
  });

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user } = useAuth();
  const { createAccount } = useAlpacaBroker();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeForm = async () => {
      if (!user) {
        navigate('/onboarding/email');
        return;
      }

      try {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile || !profile.first_name || !profile.last_name) {
          navigate('/onboarding/details');
          return;
        }

        // Pre-fill email
        setFormData(prev => ({
          ...prev,
          email: user.email || ""
        }));

      } catch (error) {
        console.error('Error initializing Alpaca form:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeForm();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = [
      'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode', 'taxId'
    ];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!formData.agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      // Get user profile for name and DOB
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Create Alpaca account with all required information
      const accountData = {
        account_type: "trading" as const,
        contact: {
          email_address: formData.email,
          phone_number: formData.phone,
          street_address: [formData.streetAddress],
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: "USA"
        },
        identity: {
          given_name: profile.first_name,
          family_name: profile.last_name,
          date_of_birth: profile.date_of_birth,
          tax_id: formData.taxId,
          tax_id_type: "USA_SSN",
          country_of_citizenship: "USA",
          country_of_birth: "USA",
          country_of_tax_residence: "USA",
          funding_source: [formData.fundingSource],
          annual_income_min: formData.annualIncomeMin,
          annual_income_max: formData.annualIncomeMax,
          total_net_worth_min: formData.totalNetWorthMin,
          total_net_worth_max: formData.totalNetWorthMax,
          liquid_net_worth_min: formData.liquidNetWorthMin,
          liquid_net_worth_max: formData.liquidNetWorthMax,
          liquidity_needs: formData.liquidityNeeds,
          investment_experience_with_stocks: formData.investmentExperienceStocks,
          investment_experience_with_options: formData.investmentExperienceOptions,
          risk_tolerance: formData.riskTolerance,
          investment_objective: formData.investmentObjective,
          investment_time_horizon: formData.investmentTimeHorizon,
          marital_status: formData.maritalStatus,
          number_of_dependents: parseInt(formData.numberOfDependents),
          party_type: "natural_person"
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
            agreement: "margin_agreement",
            signed_at: new Date().toISOString(),
            ip_address: "127.0.0.1"
          },
          {
            agreement: "account_agreement", 
            signed_at: new Date().toISOString(),
            ip_address: "127.0.0.1"
          },
          {
            agreement: "customer_agreement",
            signed_at: new Date().toISOString(),
            ip_address: "127.0.0.1"
          }
        ]
      };

      const result = await createAccount(accountData);
      
      if (result && !result.error) {
        toast({
          title: "Trading Account Created!",
          description: "Your brokerage account has been successfully set up.",
        });
        navigate('/onboarding/welcome');
      } else {
        throw new Error(result?.error || 'Failed to create account');
      }

    } catch (error: any) {
      console.error('Alpaca account creation error:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-emerald-600 dark:text-emerald-400 text-xl font-semibold mb-2">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding/details')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <OnboardingProgressBar currentStep={3} totalSteps={5} />
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Trading Account Setup</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Complete your information to set up your brokerage account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="5551234567"
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">ZIP Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Tax Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Social Security Number</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="123-45-6789"
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Financial Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncomeMin">Annual Income Range</Label>
                    <Select value={`${formData.annualIncomeMin}-${formData.annualIncomeMax}`} onValueChange={(value) => {
                      const [min, max] = value.split('-');
                      handleInputChange('annualIncomeMin', min);
                      handleInputChange('annualIncomeMax', max);
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-25000">$0 - $25,000</SelectItem>
                        <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
                        <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
                        <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
                        <SelectItem value="150000-999999999">$150,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investmentExperienceStocks">Investment Experience</Label>
                    <Select value={formData.investmentExperienceStocks} onValueChange={(value) => handleInputChange('investmentExperienceStocks', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="limited">Limited (1-2 years)</SelectItem>
                        <SelectItem value="good">Good (3-5 years)</SelectItem>
                        <SelectItem value="over_5_years">Extensive (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreed"
                    checked={formData.agreed}
                    onCheckedChange={(checked) => handleInputChange('agreed', checked ? 'true' : 'false')}
                  />
                  <Label htmlFor="agreed" className="text-sm leading-relaxed">
                    I agree to the terms and conditions and authorize the creation of my trading account
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Trading Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingAlpaca;