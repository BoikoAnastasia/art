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
  | 'transparency'
  | 'calligraphy';

  export type Brush =
  | 'pen'
  | 'calligraphy'
  | 'drip'
  | 'foam'


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

export type ToolsContextType = {
  tool: Tool;
  setTool: (s: Tool) => void;
};

export type BrushContextType = {
  brush: Brush;
  setBrush: (s: Brush) => void;
};

export type FilledShape = {
  points: number[]; // если закрытая область, массив x,y
  fill: string;
  closed: boolean;
};


// Brush
export type Point = { x: number; y: number };

export type CalligraphyBrushState = {
  lastTime?: number;
  lastSpeed?: number;
  lastAngle?: number;
  lastSize?: number;
  randState?: number;
};

export type CalligraphyBrushProps = {
  start: Point;
  end: Point;
  color: string;
  size: number;
  state?: CalligraphyBrushState;
  smoothingFactor?: number;
};

export type BrushDefaultProps = {
  ctx: CanvasRenderingContext2D;
  start: Point;
  end: Point;
  color: string;
  size: number;
};

export type DripBrushState = {
  drips: { x: number; y: number; size: number }[];
};