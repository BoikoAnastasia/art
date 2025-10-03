import { ApplyCanvasOffsetToLayersType, LayerType, Point } from '../types/share';

// Функция для применения смещения ко всем слоям
export const applyCanvasOffsetToLayers = ({
  layers,
  tempCanvasOffset,
  updateLayer,
  setTempCanvasOffset,
}: ApplyCanvasOffsetToLayersType) => {
  if (tempCanvasOffset.x === 0 && tempCanvasOffset.y === 0) return;

  // Применяем смещение ко всем слоям
  layers.forEach((layer: LayerType) => {
    const updatedLines = layer.lines.map((line) => ({
      ...line,
      points: applyOffsetToPoints(line.points, tempCanvasOffset),
    }));

    const updatedFilledShapes = layer.filledShapes.map((shape: any) => ({
      ...shape,
      points: applyOffsetToPoints(shape.points, tempCanvasOffset),
    }));

    updateLayer(updatedLines, updatedFilledShapes);
  });

  // Сбрасываем временное смещение
  setTempCanvasOffset({ x: 0, y: 0 });
};

// Перегруженные сигнатуры функции
function applyOffsetToPoints(points: Point[], offset: Point): Point[];
function applyOffsetToPoints(points: number[], offset: Point): number[];
function applyOffsetToPoints(points: unknown[], offset: Point): unknown[];

// Реализация функции
function applyOffsetToPoints(points: unknown[], offset: Point): unknown[] {
  if (!points || points.length === 0) return points;

  // Если points - это массив объектов {x, y}
  if (
    points.length > 0 &&
    typeof points[0] === 'object' &&
    points[0] !== null &&
    'x' in (points[0] as object) &&
    'y' in (points[0] as object)
  ) {
    const pointArray = points as Point[];
    return pointArray.map((point) => ({
      ...point,
      x: point.x + offset.x,
      y: point.y + offset.y,
    }));
  }

  const numberArray = points as number[];
  return numberArray.map((coord: number, index: number) => (index % 2 === 0 ? coord + offset.x : coord + offset.y));
}

export { applyOffsetToPoints };
