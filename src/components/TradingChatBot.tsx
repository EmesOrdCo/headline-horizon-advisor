import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useStockPrices } from '@/hooks/useStockPrices';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const TradingChatBot: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const activeSymbol = symbol || 'AAPL';
  const { data: stockPrices } = useStockPrices([activeSymbol]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hello! I'm your AI trading assistant. I can help you with market analysis, stock research, and trading strategies${symbol ? ` for ${symbol}` : ''}. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage called with:', inputValue);
    
    if (!inputValue.trim()) {
      console.log('❌ Empty input, returning early');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    console.log('👤 Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    console.log('⏳ Set loading to true');

    try {
      console.log('🤖 Trading Assistant: Starting request...');
      console.log('User message:', inputValue);
      console.log('Active symbol:', activeSymbol);
      
      // Get current stock data for context
      const currentStock = stockPrices?.find(s => s.symbol === activeSymbol);
      const stockData = currentStock ? {
        price: currentStock.price,
        change: currentStock.change,
        changePercent: currentStock.changePercent,
        marketStatus: 'Live Trading' // You can expand this with real market status
      } : null;

      console.log('Stock data for context:', stockData);

      // Call OpenAI trading assistant
      console.log('🚀 Calling trading-assistant edge function...');
      
      // First test if the function exists
      console.log('Supabase client available:', !!supabase);
      console.log('Functions available:', !!supabase.functions);
      
      const { data, error } = await supabase.functions.invoke('trading-assistant', {
        body: {
          message: inputValue,
          symbol: activeSymbol,
          stockData
        }
      });

      console.log('📥 Edge function response:', { data, error });
      console.log('📥 Response data type:', typeof data);
      console.log('📥 Error details:', error);

      if (error) {
        console.error('🚨 Trading assistant error:', error);
        throw error;
      }

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || data.fallbackResponse || 'I apologize, but I\'m experiencing technical difficulties. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error calling trading assistant:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I\'m currently experiencing technical difficulties. Please try again in a moment. Remember that all trading involves risk and you should always do your own research.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Trading Assistant</h3>
            <div className="text-xs text-slate-400">AI-powered market insights</div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-slate-600' 
                  : 'bg-blue-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-3 h-3 text-white" />
                ) : (
                  <Bot className="w-3 h-3 text-white" />
                )}
              </div>
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm max-w-xs lg:max-w-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-3 py-2 rounded-lg text-sm bg-slate-700 text-slate-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about stocks, market analysis, trading strategies..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default TradingChatBot;