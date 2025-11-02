import { useRef } from 'react';
import { UseDrawingToolType, Point } from '../types/share';
import { SwitchBrush } from '../utils/switchBrush';

const interpolatePoints = (a: any, b: any, steps = 3) => {
  const pts = [];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    pts.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      pressure: a.pressure + (b.pressure - a.pressure) * t,
    });
  }
  return pts;
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brush: string,
  color: string,
  size: number,
  brushState: any,
  opacity: number,
  tool: string
) => {
  if (points.length < 2) return brushState;
  const brushFunc = SwitchBrush(brush);

  ctx.save();

  // Если инструмент — ластик, стираем пиксели
  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.globalAlpha = 1;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity ?? 1;
  }

  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const currentBrushState = brushState;

  for (let i = 1; i < points.length; i++) {
    const segmentPoints = [points[i - 1], ...interpolatePoints(points[i - 1], points[i], 2), points[i]];
    for (let j = 1; j < segmentPoints.length; j++) {
      const a = segmentPoints[j - 1];
      const b = segmentPoints[j];
      const startPressure = Math.max(0.05, a.pressure ?? 1);
      const endPressure = Math.max(0.05, b.pressure ?? 1);
      const smoothed = startPressure * 0.7 + endPressure * 0.3;
      const curve = Math.pow(smoothed, 1.5);
      const adjustedSize = size * curve;

      brushState = brushFunc(ctx, {
        start: a,
        end: b,
        color,
        size: adjustedSize,
        state: brushState,
        opacity,
      });
    }
  }
  ctx.restore();
  return currentBrushState;
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
  opacity,
}: UseDrawingToolType & { layers: any; activeLayerId: any; canvasRef: any; opacity: any }) => {
  const isDrawing = useRef(false);

  const getCtx = (): CanvasRenderingContext2D | null => canvasRef.current?.getContext('2d') ?? null;

  const startDrawing = (pos: Point, pressure: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    isDrawing.current = true;

    const activeLayer = layers.find((l: any) => l.id === activeLayerId);
    if (!activeLayer) return;

    const stroke = {
      tool,
      brush,
      size,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      opacity: tool === 'eraser' ? 1 : opacity / 100,
      points: [{ ...pos, pressure: pressure ?? 1 }],
      brushState: {},
    };
    activeLayer.lines.push(stroke);

    // Рисуем первую точку
    stroke.brushState = drawLine(
      ctx,
      stroke.points,
      stroke.brush,
      stroke.color,
      stroke.size,
      stroke.brushState,
      stroke.opacity,
      tool
    );
  };

  const continueDrawing = (pos: Point, pressure: number) => {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const activeLayer = layers.find((l: any) => l.id === activeLayerId);
    if (!activeLayer) return;

    const lastStroke = activeLayer.lines[activeLayer.lines.length - 1];
    if (!lastStroke) return;

    lastStroke.points.push({ ...pos, pressure: pressure ?? 1 });
    lastStroke.brushState = drawLine(
      ctx,
      lastStroke.points,
      lastStroke.brush,
      lastStroke.color,
      lastStroke.size,
      lastStroke.brushState,
      lastStroke.opacity,
      tool
    );
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    commit();
    isDrawing.current = false;
  };

  return { startDrawing, continueDrawing, endDrawing };
};
