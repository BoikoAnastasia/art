import { useEffect } from 'react';
import { SwitchBrush } from '../utils/switchBrush';

export const LayerRenderer = ({ layers, tempCanvasOffset, flip, parent, lassoPoints, canvasRef }: any) => {
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка всего канваса перед отрисовкой всех слоёв
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // общий трансформ (offset + flip). Все слои рисуем в одной системе координат.
    ctx.translate(
      tempCanvasOffset.x + (flip.flipX ? parent.width : 0),
      tempCanvasOffset.y + (flip.flipY ? parent.height : 0)
    );
    ctx.scale(flip.flipX ? -1 : 1, flip.flipY ? -1 : 1);

    // Рисуем каждый слой по очереди
    layers.forEach((layer: any) => {
      // filledShapes
      (layer.filledShapes || []).forEach((shape: any) => {
        if (shape.isBitmap && shape.fill) {
          const img = new Image();
          img.src = shape.fill;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        } else {
          ctx.fillStyle = shape.color || '#000';
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // lines
      (layer.lines || []).forEach((line: any) => {
        if (!line.points || line.points.length < 2) return;
        const points = line.points;

        ctx.save();

        if (line.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = '#FFFFFF';
          ctx.globalAlpha = 1;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = line.color || '#000';
          ctx.globalAlpha = line.opacity ?? 1;
        }

        ctx.lineWidth = line.size || 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (!line.brush || line.brush === 'default') {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        } else {
          const brushFunc = SwitchBrush(line.brush);
          let brushState = {};
          for (let i = 1; i < points.length; i++) {
            brushState = brushFunc(ctx, {
              start: points[i - 1],
              end: points[i],
              color: line.color,
              size: line.size,
              opacity: line.opacity,
              state: brushState,
            });
          }
        }
        ctx.restore();
      });
    });

    // Лассо рисуем поверх всех слоев (в визуальной системе, поэтому оно тут же после слоёв)
    if (lassoPoints?.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(lassoPoints[0], lassoPoints[1]);
      for (let i = 2; i < lassoPoints.length; i += 2) ctx.lineTo(lassoPoints[i], lassoPoints[i + 1]);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [layers, tempCanvasOffset, flip, parent, lassoPoints, canvasRef]);

  return null;
};
