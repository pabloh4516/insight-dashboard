import React, { createContext, useContext } from 'react';
import { AnyEntry } from '@/data/mockData';

interface RealtimeContextType {
  liveEntries: AnyEntry[];
  isLive: boolean;
  toggleLive: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode; value: RealtimeContextType }> = ({ children, value }) => (
  <RealtimeContext.Provider value={value}>
    {children}
  </RealtimeContext.Provider>
);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};
