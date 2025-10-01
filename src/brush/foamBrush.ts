// brush/foamBrush.ts
import { CalligraphyBrushProps, CalligraphyBrushState } from '../types/share';

export const foamBrush = (
  ctx: CanvasRenderingContext2D,
  {
    start,
    end,
    color,
    size,
    state = {},
    smoothingFactor = 0.4,
  }: CalligraphyBrushProps
): CalligraphyBrushState => {
  const now = performance.now();
  const dt = now - (state.lastTime ?? now);

  // --- speed / angle / dynamic size smoothing (как в calligraphyBrush) ---
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const rawSpeed = dt > 0 ? dist / dt : 0;
  const speed = (state.lastSpeed ?? 0) * (1 - smoothingFactor) + rawSpeed * smoothingFactor;

  const rawAngle = Math.atan2(dy, dx);
  const angle = (state.lastAngle ?? rawAngle) * (1 - smoothingFactor) + rawAngle * smoothingFactor;

  const rawSize = Math.max(1, size - speed * 20);
  const dynamicSize = (state.lastSize ?? rawSize) * (1 - smoothingFactor) + rawSize * smoothingFactor;

  // --- deterministic PRNG (LCG) — храним только число randState в state ---
  let s = (state as CalligraphyBrushState).randState ?? Math.floor(Math.random() * 0xffffffff);
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  // --- draw a soft "arc-y" foam stroke along the segment ---
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, dynamicSize * 0.6);
  ctx.globalAlpha = 0.75;

  const steps = Math.max(6, Math.min(40, Math.round(dist / (Math.max(1, dynamicSize) * 0.6)))); // adaptive steps
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // slight perpendicular wobble to simulate bubbly edge
    const perpFactor = Math.sin(t * Math.PI * 2 + rand() * Math.PI) * (dynamicSize * 0.5) * (1 - Math.abs(0.5 - t) * 2);
    // point on line
    const x = start.x + dx * t + (-dy / (dist || 1)) * perpFactor;
    const y = start.y + dy * t + (dx / (dist || 1)) * perpFactor;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // --- foam particles (bubbles) distributed along last portion of the segment ---
  // density depends on size and speed (faster => more spray), and bias towards the end
  const baseDensity = 0.06; // базовая плотность частиц на пиксель
  const densityFactor = Math.max(0.02, baseDensity * (dynamicSize / 8) * (1 + speed * 8));
  const estParticles = Math.round(dist * densityFactor);
  const foamParticles = Math.max(3, Math.min(60, estParticles));

  // perpendicular unit vector
  const ux = dx / (dist || 1);
  const uy = dy / (dist || 1);
  const px = -uy;
  const py = ux;

  for (let i = 0; i < foamParticles; i++) {
    // bias t towards the end of the segment (so foam concentrates near the tip)
    const r = rand();
    const t = 1 - Math.pow(r, 2.5); // squaring biases high t
    const cx = start.x + dx * t;
    const cy = start.y + dy * t;

    // spread perpendicular and along direction for natural spray
    const spread = (rand() - 0.5) * dynamicSize * 2 * (1 - t) + (rand() * dynamicSize * 0.5);
    const along = (rand() - 0.6) * dynamicSize * 0.4; // slight shift along line
    const x = cx + px * spread + ux * along;
    const y = cy + py * spread + uy * along;

    // radius smaller near the ends, slightly random
    const radius = Math.max(0.4, rand() * dynamicSize * (0.25 + (1 - t) * 0.75));

    // alpha depends on radius and t (smaller bubbles are more translucent)
    const alpha = Math.max(0.15, Math.min(0.9, 0.6 * (radius / Math.max(1, dynamicSize)) * (0.7 + (1 - t) * 0.6)));

    ctx.beginPath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // --- return new state (serializable) ---
  const newState: CalligraphyBrushState = {
    ...(state as CalligraphyBrushState),
    lastTime: now,
    lastSpeed: speed,
    lastAngle: angle,
    lastSize: dynamicSize,
    randState: s,
  };

  return newState;
};
