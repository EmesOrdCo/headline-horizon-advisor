import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LogoPopulationTrigger = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [populationResult, setPopulationResult] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const { toast } = useToast();

  const checkDatabaseCount = async () => {
    try {
      const { count } = await supabase
        .from('company_logos')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    } catch (error) {
      console.error('Error checking database count:', error);
      return 0;
    }
  };

  const triggerPopulation = async () => {
    setIsPopulating(true);
    setPopulationResult(null);
    setCurrentStatus("Initializing population...");

    try {
      const initialCount = await checkDatabaseCount();
      console.log(`Initial logo count: ${initialCount}`);

      toast({
        title: "Starting Logo Population",
        description: "This will take 10-15 minutes. Check the edge function logs for detailed progress.",
      });

      setCurrentStatus("Calling populate-all-logos function...");

      const { data, error } = await supabase.functions.invoke('populate-all-logos', {
        body: { action: 'populate' }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log('Population function response:', data);
      setCurrentStatus("Population completed!");
      setPopulationResult(data);

      if (data?.success) {
        toast({
          title: "Population Complete!",
          description: `Successfully processed ${data.stocksProcessed || 0} stocks and inserted ${data.logosInserted || 0} logos.`,
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }

    } catch (error: any) {
      console.error('Error triggering logo population:', error);
      setCurrentStatus(`Error: ${error.message}`);
      toast({
        title: "Population Failed",
        description: error.message || "Failed to trigger logo population. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Logo Population
        </CardTitle>
        <CardDescription>
          Populate the database with company logos from Finnhub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={triggerPopulation} 
          disabled={isPopulating}
          className="w-full"
        >
          {isPopulating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {isPopulating ? "Populating..." : "Start Population"}
        </Button>

        {currentStatus && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{currentStatus}</span>
            </div>
          </div>
        )}

        {populationResult && (
          <div className="p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Population Complete</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Total stocks found:</strong> {populationResult.totalStocksFound || "N/A"}</p>
              <p><strong>Valid stocks filtered:</strong> {populationResult.validStocksFiltered || "N/A"}</p>
              <p><strong>Stocks processed:</strong> {populationResult.stocksProcessed || "N/A"}</p>
              <p><strong>Logos inserted:</strong> {populationResult.logosInserted || "N/A"}</p>
              <p><strong>Logos failed:</strong> {populationResult.logosFailed || "N/A"}</p>
              <p><strong>Existing logos:</strong> {populationResult.existingLogos || "N/A"}</p>
            </div>
          </div>
        )}

        {isPopulating && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Processing in background</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This operation processes ~8000 stocks and may take 10-15 minutes.
              Check the edge function logs for real-time progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};