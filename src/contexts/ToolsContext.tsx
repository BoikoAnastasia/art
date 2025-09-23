import { createContext, useContext, useState } from 'react';

type Tool =
  | 'move'
  | 'pen'
  | 'eraser'
  | 'lasso'
  | 'brush'
  | 'fill'
  | 'torch'
  | 'search'
  | 'shape'
  | 'loop'
  | 'hand'
  | 'format'
  | 'crop'
  | 'highlight'
  | 'colorize';

type ToolshContextType = {
  tool: Tool;
  setTool: (s: Tool) => void;
};

const ToolsContext = createContext<ToolshContextType | undefined>(undefined);

export const ToolsProvider = ({ children }: { children: any }) => {
  const [tool, setTool] = useState<Tool>('pen');
  return <ToolsContext.Provider value={{ tool, setTool }}>{children}</ToolsContext.Provider>;
};

export const useTool = () => {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error('useColor must be used within SizeBrushContext');
  return ctx;
};
