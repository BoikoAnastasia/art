import { useRef } from 'react';
import { UseDrawingToolType, Point } from '../types/share';
import { SwitchBrush } from '../utils/switchBrush';

const drawLine = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brush: string,
  color: string,
  size: number,
  brushState: any
) => {
  if (points.length < 2) return brushState;
  const brushFunc = SwitchBrush(brush);
  for (let i = 1; i < points.length; i++) {
    brushState = brushFunc(ctx, {
      start: points[i - 1],
      end: points[i],
      color,
      size,
      state: brushState,
    });
  }
  return brushState;
};

export const useDrawingToolKonva = ({
  tool,
  brush,
  color,
  size,
  stageRef,
  layers,
  activeLayerId,
  commit,
  canvasRef,
}: UseDrawingToolType & { layers: any; activeLayerId: any; canvasRef: any }) => {
  const isDrawing = useRef(false);

  const getCtx = (): CanvasRenderingContext2D | null => canvasRef.current?.getContext('2d') ?? null;

  const startDrawing = (pos: Point) => {
    const ctx = getCtx();
    if (!ctx) return;
    isDrawing.current = true;

    const activeLayer = layers.find((l: any) => l.id === activeLayerId);
    if (!activeLayer) return;

    const stroke = {
      tool,
      brush,
      size,
      color,
      points: [pos],
      brushState: {},
    };
    activeLayer.lines.push(stroke);

    // Рисуем первую точку
    stroke.brushState = drawLine(ctx, stroke.points, stroke.brush, stroke.color, stroke.size, stroke.brushState);
  };

  const continueDrawing = (pos: Point) => {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const activeLayer = layers.find((l: any) => l.id === activeLayerId);
    if (!activeLayer) return;

    const lastStroke = activeLayer.lines[activeLayer.lines.length - 1];
    if (!lastStroke) return;

    lastStroke.points.push(pos);
    lastStroke.brushState = drawLine(
      ctx,
      lastStroke.points,
      lastStroke.brush,
      lastStroke.color,
      lastStroke.size,
      lastStroke.brushState
    );
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    commit();
    isDrawing.current = false;
  };

  return { startDrawing, continueDrawing, endDrawing };
};
