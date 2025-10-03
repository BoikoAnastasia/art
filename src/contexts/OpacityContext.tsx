import { createContext, ReactNode, useContext, useState } from 'react';
import { SizeContextType } from '../types/share';

const OpacityContext = createContext<SizeContextType | undefined>(undefined);

export const OpacityContextProvider = ({ children }: { children: ReactNode }) => {
  const [size, setSize] = useState(100);
  return <OpacityContext.Provider value={{ size, setSize }}>{children}</OpacityContext.Provider>;
};

export const useOpacity = () => {
  const ctx = useContext(OpacityContext);
  if (!ctx) throw new Error('useOpacity must be used within OpacityContext');
  return ctx;
};
