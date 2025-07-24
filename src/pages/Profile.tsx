import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Calendar, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import { useSEO } from "@/hooks/useSEO";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useSEO({
    title: "Profile Settings - MarketSensorAI",
    description: "Manage your personal information and account settings.",
    canonical: "https://yourdomain.com/profile",
    ogType: "website",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, date_of_birth')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Error loading profile",
            description: "Failed to load your profile information.",
            variant: "destructive",
          });
        } else if (profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setEmail(profile.email || user.email || '');
          setDateOfBirth(profile.date_of_birth || '');
        }
      } catch (error) {
        console.error('Profile loading error:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadProfile();
  }, [user, navigate, toast]);

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

    if (dateOfBirth) {
      const age = validateAge(dateOfBirth);
      if (age < 10) {
        toast({
          title: "Invalid age",
          description: "You must be at least 10 years old.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          email: email,
          date_of_birth: dateOfBirth || null
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Failed to update profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        });
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
      <div className="min-h-screen bg-slate-900">
        <DashboardNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-emerald-400 text-xl font-semibold mb-2">
              Loading your profile...
            </div>
            <div className="text-slate-400">
              Please wait while we load your information.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardNav />
      
      <div className="pt-16 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <User className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Profile Settings</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    This is your primary email for account notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-slate-500">
                    Used for age verification and personalized features
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;