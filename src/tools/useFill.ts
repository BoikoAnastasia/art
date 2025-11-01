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

    // Рисуем текущий слой в канву
    activeLayer.lines.forEach((line) => {
      ctx.beginPath();
      line.points.forEach((p: any, i: number) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size;
      ctx.stroke();
    });

    // Flood fill — ЗАЛИВКА
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixel(imageData, Math.floor(clickPos.x), Math.floor(clickPos.y));
    const fillColor = parseColor(color);

    floodFill(imageData, Math.floor(clickPos.x), Math.floor(clickPos.y), targetColor, fillColor);
    ctx.putImageData(imageData, 0, 0);

    const filledImage = canvas.toDataURL(); // сохранили картинку слоя

    const newFilledShapes = [
      ...activeLayer.filledShapes,
      { x: clickPos.x, y: clickPos.y, color, isBitmap: true, fill: filledImage },
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

function floodFill(imageData: ImageData, x: number, y: number, targetColor: number[], fillColor: number[]) {
  const { width, height, data } = imageData;
  const stack = [[x, y]];

  if (colorsMatch(targetColor, fillColor)) return;

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    const idx = (cy * width + cx) * 4;

    const current = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    if (!colorsMatch(current, targetColor)) continue;

    data[idx] = fillColor[0];
    data[idx + 1] = fillColor[1];
    data[idx + 2] = fillColor[2];
    data[idx + 3] = fillColor[3];

    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < height - 1) stack.push([cx, cy + 1]);
  }
}
