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

export type Brush = 'pen' | 'calligraphy' | 'drip' | 'foam' | 'blur';

export type Flip = {
  flipX: boolean;
  flipY: boolean;
};

export type FlipContextType = {
  flip: Flip;
  setFlip: React.Dispatch<React.SetStateAction<Flip>>;
};

export type СanvasParentSizeType = {
  width: number;
  height: number;
};

export type ColorContextType = {
  color: string;
  setColor: (c: string) => void;
};
export type FilledShapesType = {
  closed: boolean;
  fill: string;
  points: Point[] | number[];
};

export type SelectionType = {
  layerId: string;
  lines: LineType[];
  x: number;
  y: number;
};

export type LineType = {
  id?: string;
  brush: string;
  brushState: any;
  color: string;
  opacity: number;
  points: Point[];
  size: number;
  tool: Tool;
  selections?: SelectionType[];
};

export type LayerShapeType = {
  closed: any;
  points: Point[];
  fill: string;
};

export type LayerType = {
  id: string;
  name: string;
  lines: LineType[];
  filledShapes: FilledShape[];
  selections?: SelectionType[];
};

export type LayersContextType = {
  layers: LayerType[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  clearActiveLayer: () => void;
  updateLayer: (lines: LineType[], filledShapes: any, opts?: { commit?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  commit: () => void;
  selection: SelectionType | null;
  setSelection: (selection: SelectionType | null) => void;
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
  points: number[];
  fill: string;
  closed: boolean;
};

export type FillAtPointType = {
  clickPos: Point;
  color: string;
  lassoPoints: number[];
};

export type CanvasType = {
  canvasParentSize: СanvasParentSizeType;
  parentContainerRef: React.RefObject<HTMLDivElement | null>;
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
export type UseCanvasZoomType = {
  scale: number;
  position: Point;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  setPosition: React.Dispatch<React.SetStateAction<Point>>;
  parentContainerRef: React.RefObject<HTMLDivElement | null>;
};

export type UseDrawingToolType = {
  tool: Tool;
  brush: Brush;
  color: string;
  opacity: number;
  size: number;
  flip: Flip;
  canvasParentSize: СanvasParentSizeType;
  stageRef: React.RefObject<any>;
  updateLayer: UpdateLayerType;
  commit: () => void;
};

export type UseCanvasTransformType = {
  tool: Tool;
  layers: LayerType[];
  tempCanvasOffset: Point;
  updateLayer: UpdateLayerType;
  setTempCanvasOffset: React.Dispatch<React.SetStateAction<Point>>;
};

export type UseCanvasDragType = {
  tool: Tool;
  isDraggingContainer: boolean;
  setIsDraggingContainer: React.Dispatch<React.SetStateAction<boolean>>;
  position: Point;
  dragOffset: React.RefObject<Point>;
  setPosition: React.Dispatch<React.SetStateAction<Point>>;
};

export type UseCanvasHandlersType = {
  tool: Tool;
  flip: Flip;
  canvasParentSize: СanvasParentSizeType;
  parentContainerRef: React.RefObject<HTMLDivElement | null>;
  setHoverPos: React.Dispatch<React.SetStateAction<Point>>;
  useDrawing: any;
  useTransform: any;
  useLasso: any;
  fillAtPoint: any;
  setColor: (c: string) => void;
  setTool: (s: Tool) => void;
  activeLayer: LayerType | undefined;
  scale: number;
  position: Point;
  commit: () => void;
  color: string;
  setTempCanvasOffset: React.Dispatch<React.SetStateAction<Point>>;
};

// renders
export type CursorRenderType = {
  hoverPos: Point;
  size: number;
  tool: Tool;
  color: string;
};

export type LayerRendererType = {
  layer: LayerType;
  tempCanvasOffset: Point;
  flip: Flip;
  parent: СanvasParentSizeType;
  lassoPoints: number[];
};

export type UpdateLayerType = (
  lines: LineType[],
  filledShapes: FilledShapesType[],
  opts?: { commit?: boolean }
) => void;

// utils
export type ApplyCanvasOffsetToLayersType = {
  layers: LayerType[];
  tempCanvasOffset: Point;
  updateLayer: UpdateLayerType;
  setTempCanvasOffset: React.Dispatch<React.SetStateAction<Point>>;
};
