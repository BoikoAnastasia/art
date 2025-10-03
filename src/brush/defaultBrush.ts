import { BrushDefaultProps } from '../types/share';

export const defaultBrush = (ctx: CanvasRenderingContext2D, { start, end, color, size }: BrushDefaultProps) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  return {};
};
