import { useRef, useState } from 'react';

export const useLasso = (tool: string) => {
  const [lassoPoints, setLassoPoints] = useState<number[]>([]);
  const isLassoDrawing = useRef(false);
  const hasMoved = useRef(false);

  const handleMouseDown = (pos: { x: number; y: number }) => {
    if (tool !== 'lasso') return;
    isLassoDrawing.current = true;
    hasMoved.current = false;
    setLassoPoints([pos.x, pos.y]);
  };

  const handleMouseMove = (pos: { x: number; y: number }) => {
    if (!isLassoDrawing.current || tool !== 'lasso') return;

    // если двигаем мышь хотя бы на 1px, считаем это дрэг
    if (!hasMoved.current) {
      const startX = lassoPoints[0];
      const startY = lassoPoints[1];
      if (Math.abs(pos.x - startX) > 1 || Math.abs(pos.y - startY) > 1) {
        hasMoved.current = true;
      }
    }

    if (hasMoved.current) {
      setLassoPoints((prev) => [...prev, pos.x, pos.y]);
    }
  };

  const handleMouseUp = () => {
    if (!isLassoDrawing.current || tool !== 'lasso') return;

    if (!hasMoved.current) {
      // просто клик — удаляем лассо
      setLassoPoints([]);
    } else if (lassoPoints.length >= 4) {
      // драг — замыкаем линию
      setLassoPoints((prev) => [...prev, prev[0], prev[1]]);
    }

    isLassoDrawing.current = false;
  };

  const clearLasso = () => {
    setLassoPoints([]);
    isLassoDrawing.current = false;
    hasMoved.current = false;
  };

  return {
    lassoPoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearLasso,
  };
};
