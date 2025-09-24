import { useRef, useState } from 'react';
import { pointInsidePolygon } from '../utils/PointInsidePolygon';

export const useLasso = (tool: string) => {
  const [lassoPoints, setLassoPoints] = useState<number[]>([]);
  // происходит ли рисование лассо
  const isDrawing = useRef(false);
  // перетаскиваем ли готовое лассо
  const isDragging = useRef(false);
  // определяем клик/драг 
  const hasMoved = useRef(false);         
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (pos: { x: number; y: number }) => {
    if (tool !== 'lasso') return;

    // если уже есть лассо и клик внутри него — начинаем drag
    if (lassoPoints.length >= 6 && pointInsidePolygon(pos, lassoPoints)) {
      isDragging.current = true;
      dragStart.current = pos;
      return;
    }

    // иначе — рисуем новое лассо
    isDrawing.current = true;
    hasMoved.current = false;
    setLassoPoints([pos.x, pos.y]);
  };

  const handleMouseMove = (pos: { x: number; y: number }) => {
    if (isDrawing.current && tool === 'lasso') {
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
    } else if (isDragging.current && dragStart.current) {
      const dx = pos.x - dragStart.current.x;
      const dy = pos.y - dragStart.current.y;
      setLassoPoints((prev) =>
        prev.map((v, i) => (i % 2 === 0 ? v + dx : v + dy))
      );
      dragStart.current = pos;
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      if (!hasMoved.current) {
        // клик без движения — убираем лассо
        setLassoPoints([]);
      } else if (lassoPoints.length >= 4) {
        // замыкаем линию
        setLassoPoints((prev) => [...prev, prev[0], prev[1]]);
      }
    }
    isDrawing.current = false;
    isDragging.current = false;
    dragStart.current = null;
  };

  const clearLasso = () => {
    setLassoPoints([]);
    isDrawing.current = false;
    isDragging.current = false;
    dragStart.current = null;
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