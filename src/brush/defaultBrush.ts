import { BrushDefaultProps, Point } from '../types/share';
import { SwitchBrush } from '../utils/switchBrush';

export interface BrushProps {
  start: any;
  end: any;
  color: string;
  size: number;
  state?: any;
}

export const defaultBrush = (ctx: CanvasRenderingContext2D, { start, end, color, size, state }: BrushProps) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  return state ?? {};
};
