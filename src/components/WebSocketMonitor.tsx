import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { alpacaCleanup } from '@/utils/alpacaConnectionManager';

export const WebSocketMonitor = () => {
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionCount(alpacaCleanup.getActiveConnectionCount());
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    alpacaCleanup.cleanup();
    setConnectionCount(0);
  };

  const getStatusColor = () => {
    if (connectionCount === 0) return 'bg-gray-500';
    if (connectionCount === 1) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (connectionCount === 0) return <WifiOff className="h-4 w-4" />;
    if (connectionCount === 1) return <Wifi className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {getStatusIcon()}
          WebSocket Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Connections:</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {connectionCount}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className="text-sm font-medium">
            {connectionCount === 0 && 'Disconnected'}
            {connectionCount === 1 && 'Connected'}
            {connectionCount > 1 && `${connectionCount} Connections (Limit Risk!)`}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>

        {connectionCount > 1 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ Multiple connections detected! This may cause "connection limit exceeded" errors.
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Page
          </Button>
          
          {connectionCount > 0 && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleCleanup}
              className="flex-1"
            >
              Force Cleanup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};