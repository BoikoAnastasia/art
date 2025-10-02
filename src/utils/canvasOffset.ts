import { ApplyCanvasOffsetToLayersType, LayerType, Point } from '../types/share';

export const applyCanvasOffsetToLayers = ({layers, tempCanvasOffset, updateLayer, setTempCanvasOffset }: ApplyCanvasOffsetToLayersType) => {
    if (tempCanvasOffset.x === 0 && tempCanvasOffset.y === 0) return;

    // Применяем смещение ко всем слоям
    layers.forEach((layer: LayerType) => {
      const updatedLines = layer.lines.map((line) => ({
        ...line,
        points: applyOffsetToPoints(line.points, tempCanvasOffset),
      }));

      const updatedFilledShapes = layer.filledShapes.map((shape) => ({
        ...shape,
        points: applyOffsetToPoints(shape.points, tempCanvasOffset),
      }));

      updateLayer(updatedLines, updatedFilledShapes);
    });

    // Сбрасываем временное смещение
    setTempCanvasOffset({ x: 0, y: 0 });
  };

  // Функция для применения смещения к точкам
export const applyOffsetToPoints = (points: Point[], offset: Point): Point[] => {
    if (!points || points.length === 0) return points;

    // Если points - это массив объектов {x, y}
    if (typeof points[0] === 'object') {
      return points.map((point) => ({
        ...point,
        x: point.x + offset.x,
        y: point.y + offset.y,
      }));
    }

    // Если points - это плоский массив [x, y, x, y, ...]
    return points.map((coord: any, index) => index % 2 === 0 ? coord + offset.x : coord + offset.y) 
  };