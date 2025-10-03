import { createContext, ReactNode, useContext, useState } from 'react';
import { ColorContextType } from '../types/share';

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider = ({ children }: { children: ReactNode }) => {
  const [color, setColor] = useState('#000');
  return <ColorContext.Provider value={{ color, setColor }}>{children}</ColorContext.Provider>;
};

export const useColor = () => {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error('useColor must be used within ColorProvider');
  return ctx;
};
