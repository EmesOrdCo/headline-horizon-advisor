import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const DisplaySettings = () => {
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedCurrency, setSelectedCurrency] = useState("gbp");
  const [defaultPage, setDefaultPage] = useState("home");

  const themes = [
    {
      id: "light",
      name: "Light",
      description: "Ignore your device settings and always render in light mode.",
      preview: "bg-white border-2 border-muted"
    },
    {
      id: "dark", 
      name: "Dark",
      description: "Ignore your device settings and always render in dark mode.",
      preview: "bg-gray-900 border-2 border-gray-700"
    },
    {
      id: "system",
      name: "System",
      description: "Match your device's display settings.",
      preview: "bg-gradient-to-r from-white to-gray-900 border-2 border-muted"
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
            <h1 className="text-2xl font-semibold">Display</h1>
          </div>

          <div className="space-y-8">
            
            {/* Themes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTheme === theme.id 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div className={`w-full h-24 rounded-md mb-3 ${theme.preview} flex items-center justify-center`}>
                        <div className="w-16 h-12 bg-green-500 rounded opacity-80"></div>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Section */}
            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-4 bg-red-500 relative">
                      <div className="absolute inset-0 bg-blue-500 clip-triangle"></div>
                      <div className="absolute inset-0 bg-white clip-cross"></div>
                    </div>
                    <span className="font-medium">English</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Display Currency Section */}
            <Card>
              <CardHeader>
                <CardTitle>Display Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gbp">Pound Sterling (£)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Your currency will show in your portfolio summary, trades are still executed in US Dollar.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Default Page Section */}
            <Card>
              <CardHeader>
                <CardTitle>Default Page Upon Log in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {["Home", "Watchlist", "Portfolio"].map((page) => (
                    <div
                      key={page.toLowerCase()}
                      className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        defaultPage === page.toLowerCase()
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setDefaultPage(page.toLowerCase())}
                    >
                      <div className="w-full h-16 bg-muted rounded mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-green-500 rounded"></div>
                      </div>
                      <p className="text-center font-medium">{page}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;