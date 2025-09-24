import { useState } from 'react';
import { pointInsidePolygon } from '../utils/PointInsidePolygon';

// Тип залитой фигуры
export type FilledShape = {
  points: number[]; // если закрытая область, массив x,y
  fill: string;
  closed: boolean;
};

// Хук
export const useFill = () => {
  const [filledShapes, setFilledShapes] = useState<FilledShape[]>([]);

  const fillAtPoint = (
    clickPos: { x: number; y: number },
    color: string,
    lassoPoints: number[] = []
  ) => {
    // Если есть лассо и клик внутри него
    if (lassoPoints.length > 0 && pointInsidePolygon(clickPos, lassoPoints)) {
      setFilledShapes((prev) => [
        ...prev,
        { points: [...lassoPoints], fill: color, closed: true },
      ]);
    } else {
      // Обычная заливка по холсту: создаем большой Rect
      setFilledShapes((prev) => [
        ...prev,
        {
          points: [0, 0], // можно будет рисовать Rect отдельно
          fill: color,
          closed: false,
        },
      ]);
    }
  };

  const clearFill = () => {
    setFilledShapes([]);
  };

  return {
    filledShapes,
    fillAtPoint,
    clearFill,
  };
};
