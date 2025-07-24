import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronDown, User, TrendingUp, Bell, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const NotificationSettings = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState({
    accountUpdates: true,
    profileChanges: false,
    securityAlerts: true,
    investingNews: true,
    marketAlerts: false,
    priceAlerts: true,
    stockUpdates: false,
    marketEvents: true,
    economicNews: false,
    depositsWithdrawals: true,
    marketingUpdates: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const sections = [
    {
      id: "account",
      title: "Account & Club",
      icon: User,
      items: [
        { key: "accountUpdates", label: "Account Updates", enabled: notifications.accountUpdates },
        { key: "profileChanges", label: "Profile Changes", enabled: notifications.profileChanges },
        { key: "securityAlerts", label: "Security Alerts", enabled: notifications.securityAlerts },
        { key: "depositsWithdrawals", label: "Deposits and Withdrawals", enabled: notifications.depositsWithdrawals },
        { key: "marketingUpdates", label: "Marketing Updates", enabled: notifications.marketingUpdates }
      ]
    },
    {
      id: "investing",
      title: "Investing",
      icon: TrendingUp,
      items: [
        { key: "investingNews", label: "Investing News", enabled: notifications.investingNews },
        { key: "marketAlerts", label: "Market Alerts", enabled: notifications.marketAlerts },
        { key: "stockUpdates", label: "Stock Updates", enabled: notifications.stockUpdates }
      ]
    },
    {
      id: "priceAlerts",
      title: "Price Alerts",
      icon: Bell,
      items: [
        { key: "priceAlerts", label: "Price Movement Alerts", enabled: notifications.priceAlerts }
      ]
    },
    {
      id: "marketEvents",
      title: "Market Events",
      icon: Calendar,
      items: [
        { key: "marketEvents", label: "Market Events", enabled: notifications.marketEvents },
        { key: "economicNews", label: "Economic News", enabled: notifications.economicNews }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Notifications</h1>
          </div>

          <div className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSections[section.id];
              
              return (
                <Card key={section.id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  
                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-sm">{item.label}</span>
                            <Switch
                              checked={item.enabled}
                              onCheckedChange={(checked) => updateNotification(item.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;