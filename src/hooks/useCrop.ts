import { useRef, useState } from 'react';
// types
import { CropType, Point, СanvasParentSizeType } from '../types/share';

export const useCropHook = (canvasParentSize: СanvasParentSizeType) => {
  const [cropRect, setCropRect] = useState<CropType>({
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

  const applyCrop = (onApplyCrop: (cropArea: СanvasParentSizeType, operation: 'crop' | 'extend') => void) => {
    const operation =
      cropRect.x < 0 ||
      cropRect.y < 0 ||
      cropRect.x + cropRect.width > canvasParentSize.width ||
      cropRect.y + cropRect.height > canvasParentSize.height
        ? 'extend'
        : 'crop';

    onApplyCrop(cropRect, operation);
    setCropRect((prev: CropType) => ({ ...prev, visible: false }));
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
