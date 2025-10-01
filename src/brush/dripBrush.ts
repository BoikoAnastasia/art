// brush/dripBrush.ts
import { CalligraphyBrushProps, CalligraphyBrushState } from '../types/share';

export const dripBrush = (
  ctx: CanvasRenderingContext2D,
  { start, end, color, size, state = {} }: CalligraphyBrushProps
): CalligraphyBrushState => {
  const now = performance.now();

  // Берём текущее состояние LCG или генерируем новое
  let s = (state as CalligraphyBrushState).randState ?? Math.floor(Math.random() * 0xffffffff);

  // Локальная LCG-функция (не сохраняем функцию в state)
  const rand = () => {
    // 32-bit LCG: s = (a*s + c) mod 2^32
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  // Рисуем основной отрезок
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Параметры «капель»
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const segLen = Math.hypot(dx, dy);
  const baseDrips = 4;
  const drips = Math.max(1, Math.round(baseDrips + size / 6 + segLen / 40));

  for (let i = 0; i < drips; i++) {
    const dripSize = (0.2 + rand() * 0.9) * size;
    const offsetX = (rand() - 0.5) * size * 2;
    const offsetY = Math.abs(rand()) * size * (2.0 + rand() * 2.0) + Math.abs(dy) * 0.2 * rand();

    const dripX = end.x + offsetX;
    const dripY = end.y + offsetY;

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);

    const midX = end.x + (dripX - end.x) * 0.5 + (rand() - 0.5) * size * 0.3;
    const midY = end.y + (dripY - end.y) * 0.5 + rand() * size * 0.2;

    ctx.quadraticCurveTo(midX, midY, dripX, dripY);

    ctx.lineWidth = Math.max(1, size * 0.25 * rand() + 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(dripX, dripY, Math.max(0.5, dripSize / 2), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();

  // Возвращаем состояние: оставляем прежние поля + обновлённый randState и lastTime
  const newState: CalligraphyBrushState = {
    ...(state as CalligraphyBrushState),
    lastTime: now,
    randState: s,
  };

  return newState;
};
