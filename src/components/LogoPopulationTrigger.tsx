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

  const triggerPopulation = async (retryCount = 0) => {
    const maxRetries = 3;
    const timeout = 30000; // 30 second timeout
    
    setIsPopulating(true);
    setPopulationResult(null);
    setCurrentStatus(`Initializing population... ${retryCount > 0 ? `(Retry ${retryCount}/${maxRetries})` : ''}`);

    try {
      const initialCount = await checkDatabaseCount();
      console.log(`Initial logo count: ${initialCount}`);

      toast({
        title: "Starting Logo Population",
        description: "This will take 10-15 minutes. Check the edge function logs for detailed progress.",
      });

      setCurrentStatus(`Connecting to populate-all-logos function... ${retryCount > 0 ? `(Retry ${retryCount}/${maxRetries})` : ''}`);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - function took too long to respond')), timeout)
      );

      // Create the function call promise
      const functionPromise = supabase.functions.invoke('populate-all-logos', {
        body: { action: 'populate' }
      });

      // Race between timeout and function call
      const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Function invocation error:', error);
        
        // Check if it's a network/connection error that might benefit from retry
        const isRetryableError = 
          error.message?.includes('fetch') || 
          error.message?.includes('network') || 
          error.message?.includes('timeout') ||
          error.message?.includes('Load failed') ||
          error.status === 500 ||
          error.status === 502 ||
          error.status === 503 ||
          error.status === 504;

        if (isRetryableError && retryCount < maxRetries) {
          console.log(`Retryable error detected, retrying in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          setCurrentStatus(`Connection failed, retrying in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          return triggerPopulation(retryCount + 1);
        }
        
        throw error;
      }

      console.log('Population function response:', data);
      setCurrentStatus("Population started successfully!");
      setPopulationResult(data);

      if (data?.success) {
        toast({
          title: "Population Started!",
          description: `Function initiated successfully. Processing ${data.stocksToProcess || 'thousands of'} stocks. Check logs for progress.`,
        });
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        // Function started but no immediate error
        toast({
          title: "Population Started",
          description: "Logo population function has been initiated. Check the edge function logs for progress.",
        });
      }

    } catch (error: any) {
      console.error('Error triggering logo population:', error);
      
      let errorMessage = "Failed to send a request to the Edge Function";
      
      if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out - the function is processing in the background. Check edge function logs.";
      } else if (error.message?.includes('fetch') || error.message?.includes('Load failed')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (error.message?.includes('Usage limit')) {
        errorMessage = "API usage limit reached. Please wait before retrying.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCurrentStatus(`Error: ${errorMessage}`);
      
      toast({
        title: "Population Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleButtonClick = () => {
    triggerPopulation();
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
          onClick={handleButtonClick} 
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