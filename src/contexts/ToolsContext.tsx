import { createContext, useContext, useState } from 'react';
import { Tool, ToolshContextType } from '../types/share';

// TODO move, lasso, fill, sensetive, shape, add brush,
// top icons, crop, format, highlight
// save, load, etc

const ToolsContext = createContext<ToolshContextType | undefined>(undefined);

export const ToolsProvider = ({ children }: { children: any }) => {
  const [tool, setTool] = useState<Tool>('calligraphy');
  return <ToolsContext.Provider value={{ tool, setTool }}>{children}</ToolsContext.Provider>;
};

export const useTool = () => {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useTool must be used within ToolsContext');
  return ctx;
};
