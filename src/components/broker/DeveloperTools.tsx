import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Code, BookOpen, Zap } from 'lucide-react';

const DeveloperTools = () => {
  const [apiResponse, setApiResponse] = useState('');
  const [isResponseVisible, setIsResponseVisible] = useState(false);

  const documentationLinks = [
    {
      title: 'Alpaca Broker API Documentation',
      url: 'https://alpaca.markets/docs/broker/',
      description: 'Complete API reference and guides',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      title: 'Trading Orders API',
      url: 'https://alpaca.markets/docs/api-references/broker-api/trading/orders/',
      description: 'Order management endpoints',
      icon: <Code className="h-4 w-4" />
    },
    {
      title: 'Sandbox Environment Guide',
      url: 'https://alpaca.markets/docs/broker/get-started/dashboard/#sandbox-environment',
      description: 'Setup and configuration',
      icon: <Zap className="h-4 w-4" />
    },
    {
      title: 'Postman Workspace',
      url: 'https://www.postman.com/alpacamarkets/workspace/alpaca-public-workspace/overview',
      description: 'Ready-to-use API collection',
      icon: <ExternalLink className="h-4 w-4" />
    }
  ];

  const populateSandboxData = () => {
    setApiResponse(`
{
  "message": "Sandbox population initiated",
  "status": "success",
  "data": {
    "accounts_created": 5,
    "funding_added": "$250,000",
    "test_orders": 12,
    "sample_positions": 8
  },
  "timestamp": "${new Date().toISOString()}"
}
    `.trim());
    setIsResponseVisible(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Debug Console
          </CardTitle>
          <CardDescription>
            Debug tools and response logging for development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={populateSandboxData} variant="outline">
              Simulate "Populate Sandbox"
            </Button>
            <Button 
              onClick={() => setIsResponseVisible(!isResponseVisible)} 
              variant="outline"
              disabled={!apiResponse}
            >
              {isResponseVisible ? 'Hide' : 'Show'} Last Response
            </Button>
          </div>

          {isResponseVisible && apiResponse && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Response</Badge>
                <Badge variant="outline">200 OK</Badge>
              </div>
              <Textarea
                value={apiResponse}
                readOnly
                className="font-mono text-sm"
                rows={10}
              />
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base URL:</span>
                <code className="text-xs">https://broker-api.sandbox.alpaca.markets</code>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <Badge variant="secondary">Sandbox</Badge>
              </div>
              <div className="flex justify-between">
                <span>API Version:</span>
                <span>v1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Resources</CardTitle>
          <CardDescription>
            Essential links and documentation for Alpaca Broker API development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {documentationLinks.map((link, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{link.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {link.description}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          Open <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sandbox Features</CardTitle>
          <CardDescription>
            What you can test in the Alpaca sandbox environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Available Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Account creation with dummy KYC</li>
                <li>• Virtual funding simulation</li>
                <li>• Order placement and execution</li>
                <li>• Portfolio tracking</li>
                <li>• Activity and transaction history</li>
                <li>• Market data access</li>
                <li>• Asset information</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">⚠️ Limitations</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• No real money or trades</li>
                <li>• Simulated market data only</li>
                <li>• Limited to sandbox hours</li>
                <li>• Some advanced features disabled</li>
                <li>• Data may be reset periodically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperTools;