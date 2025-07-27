import React from 'react';
import { useParams } from 'react-router-dom';
import AlpacaLiveChart from '@/components/AlpacaLiveChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

const AlpacaLiveChartDemo: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const currentSymbol = symbol || 'AAPL';
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Alpaca Live Trading Chart</h1>
        <p className="text-lg text-gray-600">
          Real-time stock chart powered by TradingView Lightweight Charts with Alpaca data feed and trading functionality
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo uses Alpaca's sandbox environment for safe testing. No real money is involved.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>API Keys Required:</strong> You need to set up your Alpaca API credentials in the project secrets below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>What this implementation provides:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              ✅ TradingView Lightweight Charts with default styling
            </li>
            <li className="flex items-center">
              ✅ Historical OHLCV data from Alpaca /v2/stocks/{'{'}symbol{'}'}/bars
            </li>
            <li className="flex items-center">
              ✅ Real-time WebSocket data feed from Alpaca
            </li>
            <li className="flex items-center">
              ✅ Buy/Sell trading buttons using Alpaca Broker API
            </li>
            <li className="flex items-center">
              ✅ Live price updates with trade ticks
            </li>
            <li className="flex items-center">
              ✅ Sandbox mode for safe testing
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Live Chart Component */}
      <AlpacaLiveChart symbol={currentSymbol} />

      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>How it works under the hood:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">1. Historical Data</h4>
            <p className="text-sm text-gray-600">
              Fetches OHLCV bars from Alpaca's <code>/v2/stocks/{'{'}symbol{'}'}/bars</code> endpoint
              and populates the chart using <code>series.setData()</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold">2. Real-time Updates</h4>
            <p className="text-sm text-gray-600">
              Connects to Alpaca WebSocket at <code>wss://stream.data.sandbox.alpaca.markets/v2/stocks</code>
              and updates chart with live trade data using <code>series.update()</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold">3. Trading Integration</h4>
            <p className="text-sm text-gray-600">
              Places market orders via Alpaca Broker API at <code>https://broker-api.sandbox.alpaca.markets/v1/trading/accounts</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold">4. TradingView Styling</h4>
            <p className="text-sm text-gray-600">
              Uses TradingView Lightweight Charts with default styling - no custom UI modifications
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlpacaLiveChartDemo;