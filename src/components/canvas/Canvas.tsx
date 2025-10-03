import { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';

// render
import { CursorRender } from '../../render/CursorRender';
import { LayerRenderer } from '../../render/LayerRenderer';

// context
import { useColor } from '../../contexts/ColorContext';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { useTool } from '../../contexts/ToolsContext';
import { useLayers } from '../../contexts/LayersContext';
import { useFlip } from '../../contexts/FlipContext';
import { useBrush } from '../../contexts/BrushContext';

// tools
import { useLasso } from '../../tools/useLasso';
import { useFill } from '../../tools/useFill';

// hooks
import { useCanvasZoom } from '../../hooks/useCanvasZoom';
import { useCanvasDrag } from '../../hooks/useCanvasDrag';
import { useDrawingTool } from '../../hooks/useDrawingTool';
import { useCanvasTransform } from '../../hooks/useCanvasTransform';
import { useCanvasHandlers } from '../../hooks/useCanvasHandlers';

// types
import { CanvasType } from '../../types/share';

export const Canvas = ({ canvasParentSize, parentContainerRef }: CanvasType) => {
  // refs
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // state
  const [tempCanvasOffset, setTempCanvasOffset] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // context
  const { color, setColor } = useColor();
  const { size } = useSize();
  const { size: opacity } = useOpacity();
  const { tool, setTool } = useTool();
  const { fillAtPoint } = useFill();
  const { flip } = useFlip();
  const { brush } = useBrush();
  const { layers, activeLayerId, updateLayer, commit } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);
  useCanvasZoom({ scale, position, setScale, setPosition, parentContainerRef });
  const { handleContainerMouseDown } = useCanvasDrag({
    tool,
    isDraggingContainer,
    setIsDraggingContainer,
    position,
    dragOffset,
    setPosition,
  });

  const drawing = useDrawingTool({
    tool,
    brush,
    color,
    opacity,
    size,
    flip,
    canvasParentSize,
    stageRef,
    updateLayer,
    commit,
  });
  const lasso = useLasso(tool);
  const transform = useCanvasTransform({ tool, layers, updateLayer, setTempCanvasOffset, tempCanvasOffset });
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useCanvasHandlers({
    tool,
    flip,
    canvasParentSize,
    parentContainerRef,
    setHoverPos,
    useDrawing: drawing,
    useTransform: transform,
    useLasso: lasso,
    fillAtPoint,
    setColor,
    setTool,
    activeLayer,
    scale,
    position,
    commit,
    color,
    setTempCanvasOffset,
  });

  // Clear Active Layer
  useEffect(() => {
    if (tool === 'transparency' && activeLayer) {
      updateLayer([], []);
      setTool('pen');
    }
  }, [tool, activeLayer]);

  return (
    <div
      ref={containerRef}
      onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleContainerMouseDown(e)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        background: '#fff',
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Stage
        ref={stageRef}
        width={canvasParentSize.width}
        height={canvasParentSize.height}
        style={{ cursor: tool === 'hand' ? 'grab' : tool === 'move' ? 'move' : 'none' }}
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => handleMouseDown(e)}
        onTouchMove={(e) => handleMouseMove(e)}
        onTouchEnd={handleMouseUp}
      >
        {/* Группа с инверсией и ВРЕМЕННЫМ смещением */}
        {layers?.map((layer) => (
          <LayerRenderer
            key={layer.id}
            layer={layer}
            tempCanvasOffset={tempCanvasOffset}
            flip={flip}
            parent={canvasParentSize}
            lassoPoints={lasso.lassoPoints}
          />
        ))}

        {/* Отдельный слой для курсора без инверсии */}
        <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color}></CursorRender>
      </Stage>
    </div>
  );
};
