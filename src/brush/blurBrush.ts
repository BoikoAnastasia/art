import { CalligraphyBrushProps, CalligraphyBrushState } from '../types/share';

export const blurBrush = (
  ctx: CanvasRenderingContext2D,
  { start, end, color, size, state = {} }: CalligraphyBrushProps
): CalligraphyBrushState => {
  ctx.save();

  // Основная линия — полупрозрачная
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size;
  ctx.globalAlpha = 0.12; // мягкий прозрачный слой

  const steps = 6; // количество слоёв "размытия"
  const blurSpread = size * 0.2;

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
