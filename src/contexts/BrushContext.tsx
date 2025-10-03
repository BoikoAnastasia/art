import { createContext, ReactNode, useContext, useState } from 'react';
import { Brush, BrushContextType } from '../types/share';

const BrushContext = createContext<BrushContextType | undefined>(undefined);

export const BrushProvider = ({ children }: { children: ReactNode }) => {
  const [brush, setBrush] = useState<Brush>('pen');
  return <BrushContext.Provider value={{ brush, setBrush }}>{children}</BrushContext.Provider>;
};

export const useBrush = () => {
  const ctx = useContext(BrushContext);
  if (!ctx) throw new Error('useBrush must be used within BrushContext');
  return ctx;
};
