import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RefreshContextType {
  isRefreshPaused: boolean;
  pauseRefresh: () => void;
  resumeRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefreshControl = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefreshControl must be used within a RefreshProvider');
  }
  return context;
};

interface RefreshProviderProps {
  children: ReactNode;
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [isRefreshPaused, setIsRefreshPaused] = useState(false);

  const pauseRefresh = () => {
    setIsRefreshPaused(true);
    console.log('🚫 Auto-refresh paused globally');
  };

  const resumeRefresh = () => {
    setIsRefreshPaused(false);
    console.log('▶️ Auto-refresh resumed globally');
  };

  return (
    <RefreshContext.Provider value={{ isRefreshPaused, pauseRefresh, resumeRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};