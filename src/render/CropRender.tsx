// render/CropRender.tsx
import { useEffect, useRef } from 'react';
import { Tool, СanvasParentSizeType } from '../types/share';

export const CropRender = ({
  useCrop,
  tool,
  canvasSize,
}: {
  useCrop: any;
  tool: Tool;
  canvasSize: СanvasParentSizeType;
}) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvasSize?.width && canvasSize?.height) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!useCrop.cropRect.visible) return;

    const { x, y, width, height } = useCrop.cropRect;

    // Полупрозрачная маска
    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Прямоугольник выделения
    ctx.clearRect(x, y, width, height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Можно добавить "ручки" по углам
  }, [canvasSize.height, canvasSize.width, useCrop.cropRect]);

  return (
    <canvas
      ref={overlayRef}
      width={useCrop.canvasSize?.width}
      height={useCrop.canvasSize?.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  );
};
