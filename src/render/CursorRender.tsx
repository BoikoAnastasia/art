import React, { useEffect, useRef } from 'react';
import { CursorRenderType } from '../types/share';

export const CursorRender = ({ hoverPos, size = 10, tool, color }: CursorRenderType) => {
  const cursorRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cursorRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // очистить холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // если нет позиции — не рисуем
    if (!hoverPos) return;

    const radius = size / 2;

    ctx.beginPath();
    ctx.arc(hoverPos.x, hoverPos.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = tool === 'move' || tool === 'hand' || tool === 'crop' ? 'transparent' : '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hoverPos, size, tool, color]);

  return (
    <canvas
      ref={cursorRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none', // чтобы не мешал основному холсту
      }}
    />
  );
};
