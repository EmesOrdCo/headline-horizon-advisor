import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { TimeFrame, TechnicalIndicator } from '@/types/chart';
import { TrendingUp, BarChart3, Grid, Volume, Palette } from 'lucide-react';

interface ChartControlsProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  indicators: TechnicalIndicator[];
  onIndicatorToggle: (indicatorId: string) => void;
  onIndicatorAdd: (indicator: Omit<TechnicalIndicator, 'id'>) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showVolume: boolean;
  onVolumeToggle: (show: boolean) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  timeFrame,
  onTimeFrameChange,
  indicators,
  onIndicatorToggle,
  onIndicatorAdd,
  showGrid,
  onGridToggle,
  showVolume,
  onVolumeToggle,
  theme,
  onThemeToggle
}) => {
  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' }
  ];

  const availableIndicators = [
    { type: 'MA' as const, name: 'Moving Average', params: { period: 20 }, color: '#3b82f6' },
    { type: 'MA' as const, name: 'MA (50)', params: { period: 50 }, color: '#ef4444' },
    { type: 'RSI' as const, name: 'RSI', params: { period: 14 }, color: '#8b5cf6' },
    { type: 'BOLLINGER' as const, name: 'Bollinger Bands', params: { period: 20, multiplier: 2 }, color: '#10b981' }
  ];

  const handleAddIndicator = (indicatorData: typeof availableIndicators[0]) => {
    onIndicatorAdd({
      name: indicatorData.name,
      type: indicatorData.type,
      params: indicatorData.params,
      visible: true,
      color: indicatorData.color
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Frame Selector */}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Timeframe:</span>
            <div className="flex gap-1">
              {timeFrames.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={timeFrame === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeFrameChange(value)}
                  className="px-3 py-1 h-8"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Technical Indicators */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Indicators:</span>
            <Select onValueChange={(value) => {
              const indicator = availableIndicators.find(ind => 
                `${ind.type}-${ind.name}` === value
              );
              if (indicator) {
                handleAddIndicator(indicator);
              }
            }}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Add..." />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map((indicator) => (
                  <SelectItem 
                    key={`${indicator.type}-${indicator.name}`}
                    value={`${indicator.type}-${indicator.name}`}
                  >
                    {indicator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Indicators */}
          {indicators.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {indicators.map((indicator) => (
                <Badge
                  key={indicator.id}
                  variant={indicator.visible ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => onIndicatorToggle(indicator.id)}
                  style={{ 
                    backgroundColor: indicator.visible ? indicator.color : undefined,
                    color: indicator.visible ? 'white' : undefined
                  }}
                >
                  {indicator.name}
                  {!indicator.visible && ' (hidden)'}
                </Badge>
              ))}
            </div>
          )}

          <div className="w-px h-6 bg-border" />

          {/* Display Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Grid</span>
              <Switch checked={showGrid} onCheckedChange={onGridToggle} />
            </div>
            
            <div className="flex items-center gap-2">
              <Volume className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Volume</span>
              <Switch checked={showVolume} onCheckedChange={onVolumeToggle} />
            </div>
            
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Theme</span>
              <Switch checked={theme === 'dark'} onCheckedChange={onThemeToggle} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};