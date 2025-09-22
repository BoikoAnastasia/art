import { createContext, useContext, useState } from 'react';

type OpacityContextType = {
  size: number;
  setSize: (s: number) => void;
};

const OpacityContext = createContext<OpacityContextType | undefined>(undefined);

export const OpacityContextProvider = ({ children }: { children: any }) => {
  const [size, setSize] = useState(100);
  return <OpacityContext.Provider value={{ size, setSize }}>{children}</OpacityContext.Provider>;
};

export const useOpacity = () => {
  const ctx = useContext(OpacityContext);
  if (!ctx) throw new Error('useColor must be used within OpacityContext');
  return ctx;
};
