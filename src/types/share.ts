export interface IStyledButtonLayer {
  isActive?: boolean;
}

export type Tool =
  | 'move'
  | 'pen'
  | 'eraser'
  | 'lasso'
  | 'fill'
  | 'blur'
  | 'shape'
  | 'loop'
  | 'hand'
  | 'format'
  | 'crop'
  | 'highlight'
  | 'colorize'
  | 'transparency';


export type ColorContextType = {
  color: string;
  setColor: (c: string) => void;
};

export type LayerType = {
  id: string;
  name: string;
  lines: any[];
  filledShapes: any[];
};

export type LayersContextType = {
  layers: LayerType[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  clearActiveLayer: () => void;
  updateLayer: (lines: any[], filledShapes: any[]) => void;
};

export type SizeContextType = {
  size: number;
  setSize: (s: number) => void;
};

export type ToolshContextType = {
  tool: Tool;
  setTool: (s: Tool) => void;
};

export type FilledShape = {
  points: number[]; // если закрытая область, массив x,y
  fill: string;
  closed: boolean;
};