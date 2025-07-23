import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

interface PopulationStats {
  totalStocksFound: number;
  validStocksFiltered: number;
  existingLogos: number;
  stocksNeedingLogos: number;
  stocksProcessed: number;
  logosInserted: number;
  logosFailed: number;
  remainingStocks: number;
  rateLimitedStocks: number;
  batchSize: number;
  consecutiveFailures?: number;
}

export const AutoLogoPopulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [autoMode, setAutoMode] = useState(false);
  const [batchesCompleted, setBatchesCompleted] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // PERSISTENT overnight operation - uses refs to avoid stale closures
  const isRunningRef = useRef(false);
  const autoModeRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);

  const runBatch = useCallback(async () => {
    console.log('AutoPopulator: Running batch, isRunning:', isRunningRef.current, 'autoMode:', autoModeRef.current);
    
    if (!isRunningRef.current) {
      console.log('AutoPopulator: Stopping - isRunning is false');
      return;
    }
    
    try {
      setCurrentStatus('Starting batch...');
      setLastError(null);
      
      const { data, error } = await supabase.functions.invoke('populate-all-logos', {
        body: { 
          action: 'populate',
          batchSize: 150
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setStats(data);
        setBatchesCompleted(prev => prev + 1);
        
        console.log('AutoPopulator: Batch complete, remaining:', data.remainingStocks, 'running:', isRunningRef.current, 'auto:', autoModeRef.current);
        
        // Continue if there are remaining stocks AND we're still in auto mode
        if (data.remainingStocks > 0 && isRunningRef.current && autoModeRef.current) {
          setCurrentStatus(`Batch complete. Auto-continuing in 30 seconds... (${data.remainingStocks} remaining)`);
          
          // Schedule next batch using refs to avoid stale closure issues
          setTimeout(() => {
            console.log('AutoPopulator: Scheduled batch check, running:', isRunningRef.current, 'auto:', autoModeRef.current);
            if (isRunningRef.current && autoModeRef.current) {
              runBatch().catch(error => {
                console.error('AutoPopulator: Scheduled batch failed:', error);
                // Retry on failure
                if (isRunningRef.current && autoModeRef.current) {
                  setTimeout(() => {
                    if (isRunningRef.current && autoModeRef.current) {
                      runBatch();
                    }
                  }, 60000);
                }
              });
            } else {
              console.log('AutoPopulator: Cancelled scheduled batch - state changed');
            }
          }, 30000);
        } else if (data.remainingStocks === 0) {
          setCurrentStatus('🎉 All logos populated successfully!');
          setIsRunning(false);
          setAutoMode(false);
        } else {
          setCurrentStatus('Auto mode disabled or stopped by user');
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('AutoPopulator: Batch failed:', error);
      setLastError(error.message || 'Unknown error occurred');
      setCurrentStatus('❌ Batch failed. Will retry in 2 minutes...');
      
      // Auto-retry with refs to avoid stale closures
      if (isRunningRef.current && autoModeRef.current) {
        setTimeout(() => {
          console.log('AutoPopulator: Retry check, running:', isRunningRef.current, 'auto:', autoModeRef.current);
          if (isRunningRef.current && autoModeRef.current) {
            setCurrentStatus('Retrying after error...');
            runBatch().catch(retryError => {
              console.error('AutoPopulator: Retry failed:', retryError);
              // Keep retrying if still in auto mode
              if (isRunningRef.current && autoModeRef.current) {
                setTimeout(() => {
                  if (isRunningRef.current && autoModeRef.current) {
                    runBatch();
                  }
                }, 300000); // 5 minutes on repeated failures
              }
            });
          }
        }, 120000);
      } else {
        setIsRunning(false);
      }
    }
  }, []);

  // Check current status
  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('populate-all-logos', {
        body: { action: 'status' }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setStats(data);
        setCurrentStatus('Status updated');
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setLastError(error.message || 'Status check failed');
    }
  }, []);

  // Start auto mode
  const startAutoMode = () => {
    setIsRunning(true);
    setAutoMode(true);
    setStartTime(new Date());
    setBatchesCompleted(0);
    setLastError(null);
    runBatch();
  };

  // Stop auto mode
  const stopAutoMode = () => {
    setIsRunning(false);
    setAutoMode(false);
    setCurrentStatus('Stopped by user');
  };

  // Reset everything
  const reset = () => {
    setIsRunning(false);
    setAutoMode(false);
    setStats(null);
    setCurrentStatus('');
    setBatchesCompleted(0);
    setLastError(null);
    setStartTime(null);
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    if (!stats) return 0;
    const total = stats.stocksNeedingLogos || stats.validStocksFiltered;
    const completed = stats.existingLogos + (stats.logosInserted || 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Calculate runtime
  const getRuntime = (): string => {
    if (!startTime) return '';
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Auto-check status every 5 minutes when running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(checkStatus, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isRunning, checkStatus]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
          Overnight Logo Population System
        </CardTitle>
        <CardDescription>
          Robust overnight logo population with automatic restart and error recovery
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap">
          {!isRunning ? (
            <Button onClick={startAutoMode} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Overnight Mode
            </Button>
          ) : (
            <Button onClick={stopAutoMode} variant="destructive" className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              Stop Auto Mode
            </Button>
          )}
          
          <Button onClick={checkStatus} variant="outline" disabled={isRunning}>
            Check Status
          </Button>
          
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Status Display */}
        {currentStatus && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{currentStatus}</AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {lastError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error: {lastError}</AlertDescription>
          </Alert>
        )}

        {/* Runtime Stats */}
        {startTime && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getRuntime()}</div>
              <div className="text-sm text-muted-foreground">Runtime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{batchesCompleted}</div>
              <div className="text-sm text-muted-foreground">Batches Completed</div>
            </div>
            <div className="text-center">
              <Badge variant={autoMode ? "default" : "secondary"}>
                {autoMode ? "Auto Mode ON" : "Manual Mode"}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Running" : "Stopped"}
              </Badge>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Detailed Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-primary">{stats.existingLogos?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Existing Logos</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{stats.logosInserted?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Logos Added</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-red-600">{stats.logosFailed?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-orange-600">{stats.remainingStocks?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{stats.validStocksFiltered?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Valid Stocks</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{stats.batchSize}</div>
              <div className="text-xs text-muted-foreground">Batch Size</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{stats.rateLimitedStocks}</div>
              <div className="text-xs text-muted-foreground">Rate Limited</div>
            </div>
            {stats.consecutiveFailures !== undefined && (
              <div className="text-center p-3 bg-secondary/20 rounded-lg">
                <div className="text-lg font-semibold text-red-500">{stats.consecutiveFailures}</div>
                <div className="text-xs text-muted-foreground">Consecutive Failures</div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Overnight Operation Instructions:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Start "Overnight Mode" to run continuously with automatic restart</li>
            <li>The system will automatically retry failed requests and handle rate limits</li>
            <li>Progress is saved after each batch, so you can stop and resume anytime</li>
            <li>The system uses larger batches (150 stocks) for faster overnight processing</li>
            <li>Auto-recovery will retry failed batches after 2 minutes</li>
            <li>Circuit breaker stops processing if too many consecutive failures occur</li>
          </ul>
        </div>

        {/* Success indicator */}
        {stats && stats.remainingStocks === 0 && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Logo population completed successfully! All {stats.validStocksFiltered?.toLocaleString()} valid stocks have been processed.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};