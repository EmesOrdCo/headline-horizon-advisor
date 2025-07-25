import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlpacaAsset } from '@/hooks/useAlpacaBroker';

interface AssetExplorerProps {
  assets: AlpacaAsset[];
}

const AssetExplorer = ({ assets }: AssetExplorerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [tradableFilter, setTradableFilter] = useState('all');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExchange = exchangeFilter === 'all' || asset.exchange === exchangeFilter;
    const matchesTradable = tradableFilter === 'all' || 
                           (tradableFilter === 'tradable' && asset.tradable) ||
                           (tradableFilter === 'non-tradable' && !asset.tradable);
    
    return matchesSearch && matchesExchange && matchesTradable;
  });

  const exchanges = [...new Set(assets.map(asset => asset.exchange))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Explorer</CardTitle>
          <CardDescription>Browse and filter available assets in the sandbox</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:flex-1"
            />
            
            <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Exchange" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exchanges</SelectItem>
                {exchanges.map(exchange => (
                  <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tradableFilter} onValueChange={setTradableFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tradable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="tradable">Tradable Only</SelectItem>
                <SelectItem value="non-tradable">Non-Tradable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.slice(0, 50).map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{asset.symbol}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {asset.name}
                      </p>
                    </div>
                    <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                      {asset.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Exchange:</span>
                      <Badge variant="outline">{asset.exchange}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Class:</span>
                      <span className="text-muted-foreground">{asset.asset_class}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {asset.tradable && (
                      <Badge variant="default" className="text-xs">Tradable</Badge>
                    )}
                    {asset.marginable && (
                      <Badge variant="secondary" className="text-xs">Marginable</Badge>
                    )}
                    {asset.shortable && (
                      <Badge variant="outline" className="text-xs">Shortable</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assets found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetExplorer;