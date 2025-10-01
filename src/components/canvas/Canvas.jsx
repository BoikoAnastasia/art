// Canvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Group, Shape } from 'react-konva';
import { useColor } from '../../contexts/ColorContext';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { useTool } from '../../contexts/ToolsContext';
import { useLasso } from '../../tools/useLasso';
import { useFill } from '../../tools/useFill';
import { useLayers } from '../../contexts/LayersContext';
import { useFlip } from '../../contexts/FlipContext';
import { useBrush } from '../../contexts/BrushContext';
import { SwitchBrush } from '../../utils/switchBrush';

export const Canvas = ({ parentWidth, parentHeight, parentContainerRef }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // context
  const { color, setColor } = useColor();
  const { size } = useSize();
  const { size: opacity } = useOpacity();
  const { tool, setTool } = useTool();
  const { layers, activeLayerId, updateLayer } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // state
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);

  // lasso
  const {
    lassoPoints,
    handleMouseDown: handleLassoDown,
    handleMouseMove: handleLassoMove,
    handleMouseUp: handleLassoUp,
  } = useLasso(tool);
  const { filledShapes, fillAtPoint } = useFill();
  // flip
  const { flipX, flipY } = useFlip();
  // brush
  const { brush } = useBrush();

  const MIN_SCALE = 0.0002;
  const MAX_SCALE = 10000;

  // ---------- Zoom ----------
  const handleZoom = (e, zoomIn) => {
    e.preventDefault();
    e.stopPropagation();
    const oldScale = scale;
    const scaleBy = 1.1;
    const newScale = zoomIn ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    const parentRect = parentContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - parentRect.left;
    const mouseY = e.clientY - parentRect.top;

    const scaleFactor = limitedScale / oldScale;
    const newX = mouseX - (mouseX - position.x) * scaleFactor;
    const newY = mouseY - (mouseY - position.y) * scaleFactor;

    setScale(limitedScale);
    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (!parentContainerRef.current) return;
    const handleWheel = (e) => {
      const parentRect = parentContainerRef.current.getBoundingClientRect();
      const isOverParent =
        e.clientX >= parentRect.left &&
        e.clientX <= parentRect.right &&
        e.clientY >= parentRect.top &&
        e.clientY <= parentRect.bottom;
      if (isOverParent) handleZoom(e, e.deltaY < 0);
    };

    const parentContainer = parentContainerRef.current;
    parentContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => parentContainer.removeEventListener('wheel', handleWheel);
  }, [scale, position, parentContainerRef]);

  const getStagePosFromClient = (clientX, clientY) => {
    if (!parentContainerRef.current) return { x: 0, y: 0 };
    const rect = parentContainerRef.current.getBoundingClientRect();
    // Сначала получаем координату внутри контейнера в пикселях,
    // затем компенсируем translate (position) и масштаб (scale).
    const x = (clientX - rect.left - position.x) / scale;
    const y = (clientY - rect.top - position.y) / scale;
    return { x, y };
  };

  const toLogicalPos = (pos) => {
    if (!pos) return pos;
    return {
      x: flipX ? parentWidth - pos.x : pos.x,
      y: flipY ? parentHeight - pos.y : pos.y,
    };
  };
  // ---------- Mouse Handlers ----------
  const handleMouseDown = (e) => {
    if (!activeLayer) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // визуальная позиция для курсора / color picker
    const visualPos = pos;
    // логическая позиция для записи в слои (компенсация flip)
    const logicalPos = toLogicalPos(pos);

    if (tool === 'pen') {
      isDrawing.current = true;
      const newStroke = {
        tool: 'pen',
        brush,
        size,
        color,
        opacity: opacity / 100,
        points: [logicalPos],
        brushState: {},
      };
      updateLayer([...activeLayer.lines, newStroke], activeLayer.filledShapes);
      return;
    }

    if (tool === 'hand' || tool === 'loop') return;

    if (tool === 'fill') {
      fillAtPoint(logicalPos, color, lassoPoints);
      return;
    }

    if (tool === 'lasso') {
      handleLassoDown(logicalPos);
      return;
    }

    if (tool === 'colorize') {
      const canvas = stage.toCanvas();
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(visualPos.x, visualPos.y, 1, 1).data;
      const [r, g, b, a] = pixel;
      const rgba = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      setColor(rgba);
      setTool('pen');
      return;
    }

    isDrawing.current = true;
    const newLine = { tool, size, color, opacity: opacity / 100, points: [logicalPos.x, logicalPos.y] };
    updateLayer([...activeLayer.lines, newLine], activeLayer.filledShapes);
  };

  const handleMouseMove = (e) => {
    // Для react-konva событие хранит оригинальный DOM евент в e.evt
    const clientX = e?.evt?.clientX ?? e.clientX ?? 0;
    const clientY = e?.evt?.clientY ?? e.clientY ?? 0;

    // вычисляем визуальную позицию для кружка
    const visualPos = getStagePosFromClient(clientX, clientY);
    setHoverPos(visualPos);

    // Если не рисуем — больше ничего не делаем (но курсор всё равно обновлён)
    if (!isDrawing.current || !activeLayer) {
      if (tool === 'lasso') {
        // берём pos через stage и передаём логические координаты
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (pos) {
          const logicalPos = toLogicalPos(pos);
          handleLassoMove(logicalPos);
        }
      }
      return;
    }
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos || !isDrawing.current || !activeLayer) return;

    // логическая позиция для записи в данные слоя
    const logicalPos = toLogicalPos(pos);

    if (tool === 'pen') {
      const updatedLines = [...activeLayer.lines];
      const lastStroke = updatedLines[updatedLines.length - 1];
      if (!lastStroke) return;

      const points = lastStroke.points;
      if (!points || points.length === 0) return;

      const prevPoint = points[points.length - 1];
      const brushFunc = SwitchBrush(brush);
      const brushState = lastStroke.brushState || {};

      const ctx = stageRef.current.getStage().toCanvas().getContext('2d');
      if (ctx && prevPoint && logicalPos) {
        lastStroke.brushState = brushFunc(ctx, {
          start: prevPoint,
          end: logicalPos,
          color: lastStroke.color,
          size: lastStroke.size,
          state: brushState,
        });
      }

      points.push(logicalPos);
      updateLayer(updatedLines, activeLayer.filledShapes);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'lasso') {
      handleLassoUp();
      return;
    }
    isDrawing.current = false;
  };

  // ---------- Drag Canvas ----------
  const handleContainerMouseDown = (e) => {
    if (tool !== 'hand') return;
    setIsDraggingContainer(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleContainerMouseMove = (e) => {
    if (!isDraggingContainer || tool !== 'hand') return;
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };

  const handleContainerMouseUp = () => {
    setIsDraggingContainer(false);
  };

  useEffect(() => {
    if (!isDraggingContainer) return;
    const handleMove = (e) => handleContainerMouseMove(e);
    const handleUp = () => handleContainerMouseUp();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingContainer, tool]);

  // ---------- Clear Active Layer ----------
  useEffect(() => {
    if (tool === 'transparency' && activeLayer) {
      updateLayer([], []);
      setTool('pen');
    }
  }, [tool, activeLayer]);

  // ---------- Render ----------
  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        background: '#fff',
      }}
    >
      <Stage
        ref={stageRef}
        width={parentWidth}
        height={parentHeight}
        style={{ cursor: tool === 'hand' ? 'grab' : 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Группа с инверсией и компенсацией смещения */}
        {layers?.map((layer) => (
          <Layer key={layer.id}>
            <Group
              x={flipX ? parentWidth : 0}
              y={flipY ? parentHeight : 0}
              scaleX={flipX ? -1 : 1}
              scaleY={flipY ? -1 : 1}
            >
              {layer.filledShapes?.map((shape, i) =>
                shape.closed ? (
                  <Line key={i} points={shape.points} fill={shape.fill} closed strokeEnabled={false} />
                ) : (
                  <Rect
                    key={i}
                    x={0}
                    y={0}
                    width={parentWidth}
                    height={parentHeight}
                    fill={shape.fill}
                    strokeEnabled={false}
                  />
                )
              )}

              {layer.lines?.map((line, i) => {
                const brushFunc = SwitchBrush(line.brush || 'default');

                // дефолтная кисть → обычный <Line />
                if (line.brush === 'default') {
                  return (
                    <Line
                      key={i}
                      points={line.points.flatMap((p) =>
                        typeof p === 'object' && p !== null && 'x' in p ? [p.x, p.y] : p
                      )}
                      stroke={line.color}
                      strokeWidth={line.size}
                      tension={0.5}
                      opacity={line.tool === 'eraser' ? 1 : line.opacity}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                      perfectDrawEnabled={false}
                    />
                  );
                }
                return (
                  <Shape
                    key={i}
                    sceneFunc={(ctx, shape) => {
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

              {lassoPoints.length > 0 && (
                <Line points={lassoPoints} stroke="#000" strokeWidth={1} closed dash={[4, 4]} />
              )}
            </Group>
          </Layer>
        ))}

        {/* Отдельный слой для курсора без инверсии */}
        <Layer>
          <Circle
            x={hoverPos.x}
            y={hoverPos.y}
            radius={(size || 10) / 2}
            stroke={tool === 'pen' ? color : 'none'}
            strokeWidth={1}
          />
        </Layer>
      </Stage>
    </div>
  );
};
