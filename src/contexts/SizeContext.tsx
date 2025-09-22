import { createContext, useContext, useState } from 'react';

type SizeBrushContextType = {
  size: number;
  setSize: (s: number) => void;
};

const SizeBrushContext = createContext<SizeBrushContextType | undefined>(undefined);

export const SizeBrushProvider = ({ children }: { children: any }) => {
  const [size, setSize] = useState(0);
  return <SizeBrushContext.Provider value={{ size, setSize }}>{children}</SizeBrushContext.Provider>;
};

export const useSize = () => {
  const ctx = useContext(SizeBrushContext);
  if (!ctx) throw new Error('useColor must be used within SizeBrushContext');
  return ctx;
};
