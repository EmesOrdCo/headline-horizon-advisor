import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Monitor, User, ArrowRightLeft, Bell, Shield, Database, Mail, AlertCircle, Check, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
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

  // Progress steps for account setup
  const progressSteps = [
    { label: "Create Account", completed: true },
    { label: "Verify", completed: isEmailVerified },
    { label: "Deposit", completed: false, step: 3 }
  ];
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
      href: "/profile"
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
      
      <div className="pt-16 p-6 h-[90vh] flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            
            {/* Progress Indicator Card - Spans full width */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-muted-foreground/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-12">
                  {progressSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted border-2 border-muted-foreground text-muted-foreground'
                        }`}>
                          {step.completed ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            step.step || index + 1
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-lg ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                          {step.label === "Deposit" && !step.completed && (
                            <Link 
                              to="/wallet"
                              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-1"
                            >
                              <Wallet className="w-4 h-4" />
                              Fund your account
                            </Link>
                          )}
                        </div>
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div className="w-20 h-0.5 bg-muted mx-8"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            
            {/* Settings Cards */}
            {settingsCards.map((setting, index) => {
              const IconComponent = setting.icon;
              return (
                <Link key={index} to={setting.href}>
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group border-muted-foreground/20 h-48 flex flex-col"
                  >
                    <CardHeader className="pb-4 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="p-4 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                          <IconComponent className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <Badge 
                          variant="outline" 
                          className="text-xs font-bold tracking-wide bg-muted/50 text-muted-foreground border-muted-foreground/20 mb-3"
                        >
                          {setting.title}
                        </Badge>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {setting.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;