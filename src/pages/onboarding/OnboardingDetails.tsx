
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OnboardingDetails = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      console.log('OnboardingDetails: Initializing user, current user:', user?.email, 'session:', !!session);
      
      // If no user or session, redirect to email signup
      if (!user || !session) {
        console.log('OnboardingDetails: No authenticated user, redirecting to email signup');
        navigate('/onboarding/email');
        return;
      }

      // Check profile status directly since email confirmation is disabled
      try {
        console.log('OnboardingDetails: Checking profile for:', user.id);
        
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id, onboarding_completed, first_name, last_name, date_of_birth')
          .eq('id', user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('OnboardingDetails: Profile not found, creating new profile');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              onboarding_completed: false
            });
          
          if (createError) {
            console.error('Error creating profile:', createError);
          }
        } else if (checkError) {
          console.error('Database error:', checkError);
        } else if (existingProfile) {
          console.log('OnboardingDetails: Profile exists');
          
          // If onboarding is already completed, redirect to dashboard
          if (existingProfile.onboarding_completed) {
            console.log('OnboardingDetails: Onboarding already completed, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
          
          // Pre-fill form if data exists
          if (existingProfile.first_name) setFirstName(existingProfile.first_name);
          if (existingProfile.last_name) setLastName(existingProfile.last_name);
          if (existingProfile.date_of_birth) setDateOfBirth(existingProfile.date_of_birth);
        }
      } catch (error) {
        console.error('OnboardingDetails: Error in profile initialization:', error);
      }
      
      setInitializing(false);
    };

    // Only run once when user/session changes, not on every render
    if (user && session && initializing) {
      initializeUser();
    }
  }, [user, session, initializing, navigate]);

  const validateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const age = validateAge(dateOfBirth);
    if (age < 10) {
      toast({
        title: "Age requirement not met",
        description: "You must be at least 10 years old to use this service.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          date_of_birth: dateOfBirth
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Failed to save details",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate('/onboarding/welcome');
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
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
            Loading your profile...
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Please wait while we prepare your information.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding/email')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <OnboardingProgressBar currentStep={2} totalSteps={5} />
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Tell us about yourself</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Help us personalize your experience
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="h-11"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingDetails;
