// hooks/useCropHook.ts
import { useRef, useState } from 'react';
import { Point } from '../types/share';

export const useCropHook = (canvasParentSize: any) => {
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  });
  const [isCropping, setIsCropping] = useState(false);
  const cropStart = useRef<Point>({ x: 0, y: 0 });

  const startCrop = (pos: Point) => {
    setIsCropping(true);
    cropStart.current = pos;
    setCropRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      visible: true,
    });
  };

  const continueCrop = (pos: Point) => {
    if (!isCropping) return;

    const x = Math.min(cropStart.current.x, pos.x);
    const y = Math.min(cropStart.current.y, pos.y);
    const width = Math.abs(pos.x - cropStart.current.x);
    const height = Math.abs(pos.y - cropStart.current.y);

    setCropRect({
      x,
      y,
      width,
      height,
      visible: true,
    });
  };

  const endCrop = () => {
    setIsCropping(false);
  };

  const applyCrop = (onApplyCrop: (cropArea: any, operation: 'crop' | 'extend') => void) => {
    console.log('Apply crop:', cropRect);
    // Определяем операцию: обрезка или расширение
    const operation =
      cropRect.x < 0 ||
      cropRect.y < 0 ||
      cropRect.x + cropRect.width > canvasParentSize.width ||
      cropRect.y + cropRect.height > canvasParentSize.height
        ? 'extend'
        : 'crop';

    onApplyCrop(cropRect, operation);
    setCropRect((prev) => ({ ...prev, visible: false }));
  };

  return {
    cropRect,
    isCropping,
    startCrop,
    continueCrop,
    endCrop,
    applyCrop,
    setCropRect,
  };
};
