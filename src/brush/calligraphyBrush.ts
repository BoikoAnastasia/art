// import { CalligraphyBrushProps, CalligraphyBrushState } from '../types/share';

// export const calligraphyBrush = (
//   ctx: CanvasRenderingContext2D,
//   { start, end, color, size, state = {}, smoothingFactor = 0.4 }: CalligraphyBrushProps
// ): CalligraphyBrushState => {
//   const now = performance.now();
//   const dt = now - (state.lastTime ?? now);

//   const dx = end.x - start.x;
//   const dy = end.y - start.y;
//   const dist = Math.hypot(dx, dy);
//   const rawSpeed = dt > 0 ? dist / dt : 0;

//   const speed = (state.lastSpeed ?? 0) * (1 - smoothingFactor) + rawSpeed * smoothingFactor;
//   const rawAngle = Math.atan2(dy, dx);
//   const angle = (state.lastAngle ?? rawAngle) * (1 - smoothingFactor) + rawAngle * smoothingFactor;

//   const rawSize = Math.max(2, size - speed * 25);
//   const dynamicSize = (state.lastSize ?? rawSize) * (1 - smoothingFactor) + rawSize * smoothingFactor;

//   ctx.save();
//   ctx.translate(end.x, end.y);
//   ctx.rotate(angle);
//   ctx.fillStyle = color;
//   ctx.fillRect(-dynamicSize / 2, -dynamicSize / 2, dynamicSize, dynamicSize * 2);
//   ctx.restore();

//   return { lastTime: now, lastSpeed: speed, lastAngle: angle, lastSize: dynamicSize };
// };

import { CalligraphyBrushProps, CalligraphyBrushState } from '../types/share';

export const calligraphyBrush = (
  ctx: CanvasRenderingContext2D,
  { start, end, color, size, state = {} }: CalligraphyBrushProps
): CalligraphyBrushState => {
  ctx.save();

  // Основная линия — полупрозрачная
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size;
  ctx.globalAlpha = 0.9; // мягкий прозрачный слой

  const steps = 6; // количество слоёв "размытия"
  const blurSpread = size * 0.6;

  for (let i = 0; i < steps; i++) {
    const offset = (i / steps - 0.5) * blurSpread;
    ctx.beginPath();
    ctx.moveTo(start.x + offset, start.y + offset);
    ctx.lineTo(end.x + offset, end.y + offset);
    ctx.stroke();
  }

  // Центральный штрих для плотности
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = size * 0.7;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.restore();
  return { ...state };
};
