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
  updateLayer: (lines: any[], filledShapes: any[], opts?: { commit?: boolean }) => void;
  undo: () => void; redo: () => void;
  canUndo: boolean; 
  canRedo: boolean;
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
  ctx?: CanvasRenderingContext2D;
  start: Point;
  end: Point;
  color: string;
  size: number;
};

export type DripBrushState = {
  drips: { x: number; y: number; size: number }[];
};

// hooks
export type useCanvasZoomType = {
  scale: number, 
  position: Point, 
  setScale: React.Dispatch<React.SetStateAction<number>>, 
  setPosition: React.Dispatch<React.SetStateAction<Point>>, 
  parentContainerRef: React.RefObject<HTMLDivElement | null>
}

export type useCanvasDragType = {
  tool: Tool, 
  isDraggingContainer: boolean, 
  setIsDraggingContainer: React.Dispatch<React.SetStateAction<boolean>>, 
  position: Point, 
  dragOffset: React.RefObject<Point>, 
  setPosition: React.Dispatch<React.SetStateAction<Point>>
}

// renders
export type CursorRenderType = {
  hoverPos: Point, 
  size: number,
  tool: Tool,
  color: string
}

export type LayerRendererType = {
  layer: LayerType, 
  tempCanvasOffset: Point, 
  flipX: boolean, 
  flipY: boolean, 
  parentWidth: number, 
  parentHeight: number, 
  lassoPoints: number[]
}

export type UpdateLayerType = (
  lines?: any[],
  filledShapes?: any[],
  opts?: { commit?: boolean }
) => void;

// utils
export type ApplyCanvasOffsetToLayersType = {
  layers: LayerType[], 
  tempCanvasOffset: Point, 
  updateLayer: UpdateLayerType, 
  setTempCanvasOffset: React.Dispatch<React.SetStateAction<Point>>
}