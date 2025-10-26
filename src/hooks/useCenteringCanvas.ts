// hooks/useCenteringCanvas.ts
import { useEffect } from 'react';
import { UseCenteringCanvasType } from '../types/share';

export const useCenteringCanvas = ({
  parentContainerRef,
  canvasParentSize,
  setScale,
  setPosition,
  paddingFactor,
}: UseCenteringCanvasType) => {
  useEffect(() => {
    if (!parentContainerRef.current || !canvasParentSize.width || !canvasParentSize.height) return;

    centerCanvas(canvasParentSize);
  }, [parentContainerRef, canvasParentSize.width, canvasParentSize.height, paddingFactor, setScale, setPosition]);

  // Экспортируем функцию центрирования для использования извне
  const centerCanvas = (size: { width: number; height: number }) => {
    if (!parentContainerRef.current) return;

    const parent = parentContainerRef.current.getBoundingClientRect();

    // Базовый масштаб
    const scaleX = parent.width / size.width;
    const scaleY = parent.height / size.height;
    const baseScale = Math.min(scaleX, scaleY);

    // Уменьшение масштаба
    const newScale = baseScale * paddingFactor;

    // Центрирование
    const centeredX = (parent.width - size.width * newScale) / 2;
    const centeredY = (parent.height - size.height * newScale) / 2;

    setScale(newScale);
    setPosition({ x: centeredX, y: centeredY });
  };

  return { centerCanvas };
};
