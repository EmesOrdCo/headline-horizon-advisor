import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Monitor, User, ArrowRightLeft, Bell, Shield, Database, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resendingEmail, setResendingEmail] = useState(false);

  const isEmailVerified = user?.email_confirmed_at !== null;

  const handleResendVerificationEmail = async () => {
    if (!user?.email) return;

    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Failed to send verification email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your email and click the verification link.",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };
  const settingsCards = [
    {
      icon: Monitor,
      title: "DISPLAY",
      description: "Set your language, currency and other general preferences",
      href: "/settings/display"
    },
    {
      icon: User,
      title: "ACCOUNT",
      description: "Change your account credentials and secure it",
      href: "/settings/account"
    },
    {
      icon: ArrowRightLeft,
      title: "TRADING",
      description: "Modify your core trading experience",
      href: "/settings/trading"
    },
    {
      icon: Bell,
      title: "NOTIFICATIONS",
      description: "Opt-in or out from any communication you receive",
      href: "/settings/notifications"
    },
    {
      icon: Shield,
      title: "PRIVACY",
      description: "Control how others see you and your activity",
      href: "/settings/privacy"
    },
    {
      icon: Database,
      title: "RECURRING ORDERS",
      description: "Set up or manage your automatic deposits",
      href: "/settings/recurring-orders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Email Verification Section */}
          {isEmailVerified ? (
            <Card className="mb-8 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Verification Centre
                  </CardTitle>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Your profile is fully verified!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    Email Verification Required
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-orange-700 dark:text-orange-300">
                  Please verify your email address to complete your account setup and access all features.
                </p>
                <Button 
                  onClick={handleResendVerificationEmail}
                  disabled={resendingEmail}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {resendingEmail ? "Sending..." : "Resend Verification Email"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCards.map((setting, index) => {
              const IconComponent = setting.icon;
              return (
                <Card 
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group border-muted-foreground/20"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <IconComponent className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-bold tracking-wide bg-muted/50 text-muted-foreground border-muted-foreground/20"
                    >
                      {setting.title}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {setting.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;