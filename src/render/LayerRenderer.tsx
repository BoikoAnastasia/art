import { Group, Layer, Line, Rect, Shape } from 'react-konva';
import { SwitchBrush } from '../utils/switchBrush';
import { LayerRendererType, Point } from '../types/share';

export const LayerRenderer = ({ layer, tempCanvasOffset, flip, parent, lassoPoints }: LayerRendererType) => {
  return (
    <Layer>
      <Group
        x={tempCanvasOffset.x + (flip.flipX ? parent.width : 0)}
        y={tempCanvasOffset.y + (flip.flipY ? parent.height : 0)}
        scaleX={flip.flipX ? -1 : 1}
        scaleY={flip.flipY ? -1 : 1}
      >
        {layer.filledShapes?.map((shape: any, i: number) =>
          shape.closed ? (
            <Line key={i} points={shape.points} fill={shape.fill} closed strokeEnabled={false} />
          ) : (
            <Rect
              key={i}
              x={0}
              y={0}
              width={parent.width}
              height={parent.height}
              fill={shape.fill}
              strokeEnabled={false}
            />
          )
        )}

        {layer.lines?.map((line, i: number) => {
          // Для ластика используем специальную логику
          if (line.tool === 'eraser') {
            return (
              <Line
                key={i}
                points={line.points.flatMap((p: Point) =>
                  typeof p === 'object' && p !== null && 'x' in p ? [p.x, p.y] : p
                )}
                stroke="#FFFFFF" // Белый цвет для ластика
                strokeWidth={line.size}
                tension={0.5}
                opacity={1}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-out" // Это ключевое свойство для ластика
                perfectDrawEnabled={false}
              />
            );
          }

          const brushFunc = SwitchBrush(line.brush || 'default');

          if (line.brush === 'default' || !line.brush) {
            return (
              <Line
                key={i}
                points={line.points.flatMap((p: Point) =>
                  typeof p === 'object' && p !== null && 'x' in p ? [p.x, p.y] : p
                )}
                stroke={line.color}
                strokeWidth={line.size}
                tension={0.5}
                opacity={line.opacity}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
                perfectDrawEnabled={false}
              />
            );
          }
          return (
            <Shape
              key={i}
              sceneFunc={(ctx: any, shape: any) => {
                ctx.save();
                ctx.globalAlpha = line.opacity;
                for (let j = 1; j < line.points.length; j++) {
                  const start = line.points[j - 1];
                  const end = line.points[j];
                  if (!start || !end) continue;
                  brushFunc(ctx, {
                    start,
                    end,
                    color: line.color,
                    size: line.size,
                    state: {}, // без динамики
                  });
                }

                ctx.restore();
                ctx.fillStrokeShape(shape);
              }}
            />
          );
        })}

        {lassoPoints.length > 0 && <Line points={lassoPoints} stroke="#000" strokeWidth={1} closed dash={[4, 4]} />}
      </Group>
    </Layer>
  );
};
