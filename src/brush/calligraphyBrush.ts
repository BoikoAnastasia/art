// calligraphyBrush.ts
export type Point = { x: number; y: number };

export type CalligraphyBrushState = {
  lastTime?: number;
  lastSpeed?: number;
  lastAngle?: number;
  lastSize?: number;
};

export type CalligraphyBrushProps = {
  ctx: CanvasRenderingContext2D;
  start: Point;
  end: Point;
  color: string;
  size: number;
  state?: CalligraphyBrushState;
  smoothingFactor?: number;
};

export const calligraphyBrush = ({
  ctx,
  start,
  end,
  color,
  size,
  state = {},
  smoothingFactor = 0.4,
}: CalligraphyBrushProps): CalligraphyBrushState => {
  const now = performance.now();
  const dt = now - (state.lastTime ?? now);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const rawSpeed = dt > 0 ? dist / dt : 0;

  const speed = (state.lastSpeed ?? 0) * (1 - smoothingFactor) + rawSpeed * smoothingFactor;
  const rawAngle = Math.atan2(dy, dx);
  const angle = (state.lastAngle ?? rawAngle) * (1 - smoothingFactor) + rawAngle * smoothingFactor;

  const rawSize = Math.max(2, size - speed * 25);
  const dynamicSize = (state.lastSize ?? rawSize) * (1 - smoothingFactor) + rawSize * smoothingFactor;

  ctx.save();
  ctx.translate(end.x, end.y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-dynamicSize / 2, -dynamicSize / 2, dynamicSize, dynamicSize * 2);
  ctx.restore();

  return { lastTime: now, lastSpeed: speed, lastAngle: angle, lastSize: dynamicSize };
};
