// Canvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
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
import { useCanvasZoom } from '../../hooks/useCanvasZoom';
import { useCanvasDrag } from '../../hooks/useCanvasDrag';
import { CursorRender } from '../../render/CursorRender';
import { LayerRenderer } from '../../render/LayerRenderer';
import { applyCanvasOffsetToLayers } from '../../utils/canvasOffset';
import { getStagePosFromClient, toLogicalPos } from '../../utils/position';

export const Canvas = ({ parentWidth, parentHeight, parentContainerRef }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [tempCanvasOffset, setTempCanvasOffset] = useState({ x: 0, y: 0 });
  const moveStart = useRef({ x: 0, y: 0 });
  const isMovingCanvas = useRef(false);

  // context
  const { color, setColor } = useColor();
  const { size } = useSize();
  const { size: opacity } = useOpacity();
  const { tool, setTool } = useTool();

  // state
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);

  // lasso
  const {
    lassoPoints,
    handleMouseDown: handleLassoDown,
    handleMouseMove: handleLassoMove,
    handleMouseUp: handleLassoUp,
  } = useLasso(tool);

  // flip
  const { flipX, flipY } = useFlip();
  // brush
  const { brush } = useBrush();
  // layers
  const { layers, activeLayerId, updateLayer, commit } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const { filledShapes, fillAtPoint } = useFill({
    activeLayer,
    updateLayer,
    parentWidth,
    parentHeight,
    lassoPoints,
  });

  // zoom
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useCanvasZoom({ scale, position, setScale, setPosition, parentContainerRef });

  // drag
  const { handleContainerMouseDown } = useCanvasDrag({
    tool,
    isDraggingContainer,
    setIsDraggingContainer,
    position,
    dragOffset,
    setPosition,
  });

  // ---------- Mouse Handlers ----------
  const handleMouseDown = (e) => {
    if (!activeLayer) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const visualPos = pos;
    const logicalPos = toLogicalPos(pos, flipX, flipY, parentWidth, parentHeight);

    // Режим перемещения - начинаем перетаскивание холста
    if (tool === 'move') {
      moveStart.current = pos;
      isMovingCanvas.current = true;
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      isDrawing.current = true;
      const newStroke = {
        tool: tool, // Важно: используем текущий инструмент
        brush,
        size,
        color: tool === 'eraser' ? '#FFFFFF' : color, // Для ластика используем белый цвет (или прозрачный)
        opacity: tool === 'eraser' ? 1 : opacity / 100,
        points: [logicalPos],
        brushState: {},
      };
      updateLayer([...activeLayer.lines, newStroke], activeLayer.filledShapes, { commit: false });
      return;
    }

    if (tool === 'hand' || tool === 'loop') return;

    if (tool === 'fill') {
      fillAtPoint(logicalPos, color);
      commit();
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
    const newLine = {
      tool,
      size,
      color,
      opacity: opacity / 100,
      points: [logicalPos.x, logicalPos.y],
    };
    updateLayer([...activeLayer.lines, newLine], activeLayer.filledShapes);
  };

  const handleMouseMove = (e) => {
    const clientX = e?.evt?.clientX ?? e.clientX ?? 0;
    const clientY = e?.evt?.clientY ?? e.clientY ?? 0;

    const visualPos = getStagePosFromClient(clientX, clientY, parentContainerRef, scale, position);
    setHoverPos(visualPos);

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const logicalPos = toLogicalPos(pos, flipX, flipY, parentWidth, parentHeight);

    // Режим перемещения - временное перемещение холста
    if (tool === 'move' && isMovingCanvas.current) {
      const dx = pos.x - moveStart.current.x;
      const dy = pos.y - moveStart.current.y;
      setTempCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      moveStart.current = pos;
      return;
    }

    if (!isDrawing.current || !activeLayer) {
      if (tool === 'lasso') {
        handleLassoMove(logicalPos);
      }
      return;
    }

    // Обрабатываем и перо, и ластик
    if (tool === 'pen' || tool === 'eraser') {
      const updatedLines = [...activeLayer.lines];
      const lastStroke = updatedLines[updatedLines.length - 1];
      if (!lastStroke) return;

      const points = lastStroke.points;
      if (!points || points.length === 0) return;

      const prevPoint = points[points.length - 1];
      const brushFunc = SwitchBrush(brush);
      const brushState = lastStroke.brushState || {};

      // Для ластика не используем кисти, только стандартное поведение
      if (tool === 'pen' && brush !== 'default') {
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
      }

      points.push(logicalPos);
      updateLayer(updatedLines, activeLayer.filledShapes, { commit: false });
    }
  };

  const handleMouseUp = () => {
    if (tool === 'lasso') {
      handleLassoUp();
    } else if (tool === 'move' && isMovingCanvas.current) {
      // Применяем смещение ко всем слоям
      applyCanvasOffsetToLayers({ layers, tempCanvasOffset, updateLayer, setTempCanvasOffset });
      isMovingCanvas.current = false;
    }
    if (isDrawing.current) {
      commit();
    }
    isDrawing.current = false;
  };

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
        style={{ cursor: tool === 'hand' ? 'grab' : tool === 'move' ? 'move' : 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Группа с инверсией и ВРЕМЕННЫМ смещением */}
        {layers?.map((layer) => (
          <LayerRenderer
            key={layer.id}
            layer={layer}
            tempCanvasOffset={tempCanvasOffset}
            flipX={flipX}
            flipY={flipY}
            parentWidth={parentWidth}
            parentHeight={parentHeight}
            lassoPoints={lassoPoints}
          />
        ))}

        {/* Отдельный слой для курсора без инверсии */}
        <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color}></CursorRender>
      </Stage>
    </div>
  );
};
