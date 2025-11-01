import { useLayers } from '../contexts/LayersContext';
import { Point } from '../types/share';

export const useFill = () => {
  const { layers, activeLayerId, updateLayer, canvasSize } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const fillAtPoint = (clickPos: Point, color: string) => {
    if (!activeLayer) return;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Рисуем линии слоя
    activeLayer.lines.forEach((line) => {
      ctx.beginPath();
      line.points.forEach((p: any, i: number) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size;
      ctx.stroke();
    });

    // Получаем ImageData слоя
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixel(imageData, Math.floor(clickPos.x), Math.floor(clickPos.y));
    const fillColor = parseColor(color);

    // Flood fill и bounding box
    const bounds = { minX: canvas.width, minY: canvas.height, maxX: 0, maxY: 0 };
    floodFill(imageData, Math.floor(clickPos.x), Math.floor(clickPos.y), targetColor, fillColor, bounds);
    ctx.putImageData(imageData, 0, 0);

    // Crop только залитую область
    const width = bounds.maxX - bounds.minX + 1;
    const height = bounds.maxY - bounds.minY + 1;
    if (width <= 0 || height <= 0) return;

    const bitmapCanvas = document.createElement('canvas');
    bitmapCanvas.width = width;
    bitmapCanvas.height = height;
    const bitmapCtx = bitmapCanvas.getContext('2d');
    if (!bitmapCtx) return;

    bitmapCtx.putImageData(ctx.getImageData(bounds.minX, bounds.minY, width, height), 0, 0);
    const filledImage = bitmapCanvas.toDataURL();

    // ✅ Сохраняем с абсолютными координатами, без offsetX/offsetY
    const newFilledShapes = [
      ...activeLayer.filledShapes,
      {
        isBitmap: true,
        fill: filledImage,
        x: bounds.minX, // ✅ Абсолютная позиция X
        y: bounds.minY, // ✅ Абсолютная позиция Y
        width,
        height,
      },
    ];

    updateLayer(activeLayer.lines, newFilledShapes);
  };

  return { fillAtPoint };
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getPixel(imageData: ImageData, x: number, y: number) {
  const idx = (y * imageData.width + x) * 4;
  const d = imageData.data;
  return [d[idx], d[idx + 1], d[idx + 2], d[idx + 3]];
}

function parseColor(color: string): [number, number, number, number] {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return [0, 0, 0, 255];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
}

function colorsMatch(a: number[], b: number[]) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function floodFill(
  imageData: ImageData,
  x: number,
  y: number,
  targetColor: number[],
  fillColor: number[],
  bounds: any
) {
  const { width, height, data } = imageData;
  const stack = [[x, y]];
  if (colorsMatch(targetColor, fillColor)) return;

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

    const idx = (cy * width + cx) * 4;
    const current = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    if (!colorsMatch(current, targetColor)) continue;

    // Заливаем
    data[idx] = fillColor[0];
    data[idx + 1] = fillColor[1];
    data[idx + 2] = fillColor[2];
    data[idx + 3] = fillColor[3];

    // Обновляем bounds
    bounds.minX = Math.min(bounds.minX, cx);
    bounds.minY = Math.min(bounds.minY, cy);
    bounds.maxX = Math.max(bounds.maxX, cx);
    bounds.maxY = Math.max(bounds.maxY, cy);

    stack.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
  }
}
