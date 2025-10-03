import { createContext, ReactNode, useContext, useState } from 'react';
import { SizeContextType } from '../types/share';

const SizeBrushContext = createContext<SizeContextType | undefined>(undefined);

export const SizeBrushProvider = ({ children }: { children: ReactNode }) => {
  const [size, setSize] = useState(5);
  return <SizeBrushContext.Provider value={{ size, setSize }}>{children}</SizeBrushContext.Provider>;
};

export const useSize = () => {
  const ctx = useContext(SizeBrushContext);
  if (!ctx) throw new Error('useSize must be used within SizeBrushContext');
  return ctx;
};
