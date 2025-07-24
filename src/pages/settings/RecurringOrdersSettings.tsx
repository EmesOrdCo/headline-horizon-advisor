import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";

const RecurringOrdersSettings = () => {
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
            <h1 className="text-2xl font-semibold">Recurring Orders</h1>
          </div>

          {/* Recurring Deposits Card */}
          <Card>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-xl">Recurring Deposits</CardTitle>
              <div className="flex justify-center mt-6">
                <Calendar className="w-20 h-20 text-muted-foreground" strokeWidth={1} />
              </div>
              <div className="mt-6 space-y-2 text-center max-w-2xl mx-auto">
                <p className="text-muted-foreground">
                  To get started, you'll need to make one manual deposit with your credit or debit card. Then you can easily set up recurring deposits.
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="text-center">
              <Link to="/wallet">
                <Button 
                  size="lg" 
                  className="w-full max-w-xs mx-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  Deposit
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default RecurringOrdersSettings;