import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Play, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LogoPopulationTrigger = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [populationResult, setPopulationResult] = useState<any>(null);
  const { toast } = useToast();

  const triggerPopulation = async () => {
    setIsPopulating(true);
    setPopulationResult(null);

    try {
      toast({
        title: "Starting Logo Population",
        description: "This will take several minutes to complete. Check the edge function logs for progress.",
      });

      const { data, error } = await supabase.functions.invoke('populate-all-logos', {
        body: { action: 'populate' }
      });

      if (error) {
        throw error;
      }

      setPopulationResult(data);
      toast({
        title: "Population Complete",
        description: `Successfully processed ${data.stocksProcessed} stocks and inserted ${data.logosInserted} logos.`,
      });

    } catch (error: any) {
      console.error('Error triggering logo population:', error);
      toast({
        title: "Population Failed",
        description: error.message || "Failed to trigger logo population",
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
          <Play className="w-4 h-4 mr-2" />
          {isPopulating ? "Populating..." : "Start Population"}
        </Button>

        {populationResult && (
          <div className="p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Population Complete</span>
            </div>
            <div className="text-sm space-y-1">
              <p>Total stocks found: {populationResult.totalStocksFound}</p>
              <p>Valid stocks filtered: {populationResult.validStocksFiltered}</p>
              <p>Stocks processed: {populationResult.stocksProcessed}</p>
              <p>Logos inserted: {populationResult.logosInserted}</p>
              <p>Existing logos: {populationResult.existingLogos}</p>
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