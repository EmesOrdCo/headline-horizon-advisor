import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Monitor, User, ArrowRightLeft, Bell, Shield, Database } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";

const Settings = () => {
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Verification Centre */}
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
  );
};

export default Settings;