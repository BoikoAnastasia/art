import { ApplyCanvasOffsetToLayersType, LayerType, Point } from '../types/share';

export const applyCanvasOffsetToLayers = ({
  layers,
  tempCanvasOffset,
  updateLayer,
  setTempCanvasOffset,
}: ApplyCanvasOffsetToLayersType) => {
  if (tempCanvasOffset.x === 0 && tempCanvasOffset.y === 0) return;

  layers.forEach((layer: LayerType) => {
    const updatedLines = layer.lines.map((line) => ({
      ...line,
      points: line.points ? applyOffsetToPoints(line.points, tempCanvasOffset) : line.points,
    }));

    const updatedFilledShapes = layer.filledShapes.map((shape: any) => {
      if (shape.isBitmap) {
        // Для bitmap просто сдвигаем координаты x, y
        return {
          ...shape,
          x: (shape.x || 0) + tempCanvasOffset.x,
          y: (shape.y || 0) + tempCanvasOffset.y,
        };
      } else if (shape.points) {
        return {
          ...shape,
          points: applyOffsetToPoints(shape.points, tempCanvasOffset),
        };
      }
      return shape;
    });

    updateLayer(updatedLines, updatedFilledShapes);
  });

  setTempCanvasOffset({ x: 0, y: 0 });
};

// Перегруженные сигнатуры функции
function applyOffsetToPoints(points: Point[], offset: Point): Point[];
function applyOffsetToPoints(points: number[], offset: Point): number[];
function applyOffsetToPoints(points: unknown[], offset: Point): unknown[];

function applyOffsetToPoints(points: unknown[], offset: Point): unknown[] {
  if (!points || points.length === 0) return points;

  if (typeof points[0] === 'object' && points[0] !== null && 'x' in (points[0] as object)) {
    const pointArray = points as Point[];
    return pointArray.map((p) => ({ ...p, x: p.x + offset.x, y: p.y + offset.y }));
  }

  const numberArray = points as number[];
  return numberArray.map((coord: number, i: number) => (i % 2 === 0 ? coord + offset.x : coord + offset.y));
}

export { applyOffsetToPoints };
