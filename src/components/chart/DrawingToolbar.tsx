import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer2, 
  Move, 
  Minus,
  TrendingUp,
  Type,
  Circle,
  Square,
  Triangle,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  Palette
} from 'lucide-react';

export type DrawingTool = 
  | 'cursor'
  | 'hand' 
  | 'line'
  | 'trend'
  | 'text'
  | 'circle'
  | 'rectangle'
  | 'triangle';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClearAll: () => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
  onColorChange: (color: string) => void;
  selectedColor: string;
}

const tools = [
  { id: 'cursor' as DrawingTool, icon: MousePointer2, label: 'Cursor', shortcut: 'C' },
  { id: 'hand' as DrawingTool, icon: Move, label: 'Hand Tool', shortcut: 'H' },
  { id: 'line' as DrawingTool, icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'trend' as DrawingTool, icon: TrendingUp, label: 'Trend Line', shortcut: 'T' },
  { id: 'text' as DrawingTool, icon: Type, label: 'Text', shortcut: 'X' },
  { id: 'circle' as DrawingTool, icon: Circle, label: 'Circle', shortcut: 'O' },
  { id: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'triangle' as DrawingTool, icon: Triangle, label: 'Triangle', shortcut: 'G' }
];

const colors = [
  '#ffffff', // White
  '#ff4444', // Red
  '#44ff44', // Green
  '#4444ff', // Blue
  '#ffff44', // Yellow
  '#ff44ff', // Magenta
  '#44ffff', // Cyan
  '#ff8844', // Orange
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  onToolChange,
  onClearAll,
  onToggleVisibility,
  isVisible,
  onColorChange,
  selectedColor
}) => {
  const [showColorPalette, setShowColorPalette] = useState(false);

  return (
    <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Main Drawing Tools */}
      <div className="flex flex-col py-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon"
            className={`
              w-10 h-10 mx-1 my-0.5 rounded-sm text-slate-400 hover:text-white 
              ${activeTool === tool.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}
            `}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-600 mx-auto my-2" />

      {/* Color Picker */}
      <div className="flex flex-col items-center py-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mx-1 mb-1 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 relative"
          onClick={() => setShowColorPalette(!showColorPalette)}
          title="Color Picker"
        >
          <Palette className="w-4 h-4" />
          <div 
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-500"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>

        {/* Color Palette */}
        {showColorPalette && (
          <div className="absolute left-12 bg-slate-800 border border-slate-600 rounded-md p-2 grid grid-cols-2 gap-1 z-50">
            {colors.map((color) => (
              <button
                key={color}
                className={`
                  w-6 h-6 rounded border-2 transition-all
                  ${selectedColor === color ? 'border-blue-400 scale-110' : 'border-slate-500 hover:border-slate-400'}
                `}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onColorChange(color);
                  setShowColorPalette(false);
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-600 mx-auto my-2" />

      {/* Action Tools */}
      <div className="flex flex-col py-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mx-1 my-0.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700"
          onClick={onToggleVisibility}
          title={isVisible ? 'Hide Drawings' : 'Show Drawings'}
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mx-1 my-0.5 rounded-sm text-slate-400 hover:text-red-400 hover:bg-slate-700"
          onClick={onClearAll}
          title="Clear All Drawings"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mx-1 my-0.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700"
          title="Undo Last"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mx-1 my-0.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700"
          title="Drawing Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Click outside to close color palette */}
      {showColorPalette && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowColorPalette(false)}
        />
      )}
    </div>
  );
};