export interface BrushProps {
  start: any;
  end: any;
  color: string;
  size: number;
  state?: any;
}

export const airbrush = (ctx: CanvasRenderingContext2D, { start, end, color, size, state = {} }: BrushProps) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(5, Math.round(dist / 2));

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const x = start.x + dx * t + (Math.random() - 0.5) * size;
    const y = start.y + dy * t + (Math.random() - 0.5) * size;

    const radius = Math.random() * size * 0.5;
    const alpha = 0.05 + Math.random() * 0.1;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return state;
};

// Вспомогательная функция для конвертации hex в rgb
const hexToRgb = (hex: string) => {
  const parsed = hex.replace('#', '');
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
};
