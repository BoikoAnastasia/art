import { useEffect, useRef, useState } from 'react';
// konva
import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import { Rect as RectType } from 'konva/lib/shapes/Rect';
// render
import { CursorRender } from '../../render/CursorRender';
import { LayerRenderer } from '../../render/LayerRenderer';
import { CropRender } from '../../render/CropRender';
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
// utils
import { handleApplyCrop } from '../../utils/crop/handleApplyCrop';
// hooks
import { useCanvasZoom } from '../../hooks/useCanvasZoom';
import { useCanvasDrag } from '../../hooks/useCanvasDrag';
import { useDrawingTool } from '../../hooks/useDrawingTool';
import { useCanvasTransform } from '../../hooks/useCanvasTransform';
import { useCanvasHandlers } from '../../hooks/useCanvasHandlers';
import { useCropHook } from '../../hooks/useCrop';
// types
import { CanvasType } from '../../types/share';
import { useCenteringCanvas } from '../../hooks/useCenteringCanvas';

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
  const { flip } = useFlip();
  const { brush } = useBrush();
  const { layers, activeLayerId, updateLayer, commit, canvasSize, updateCanvasSize, setLayers } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const transformerRef = useRef<Konva.Transformer | null>(null);
  const cropRectRef = useRef<RectType>(null);

  // tools
  const { fillAtPoint } = useFill();
  const lasso = useLasso(tool);
  // hooks
  const useCrop = useCropHook(canvasParentSize);

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
    useCrop,
  });
  const { centerCanvas } = useCenteringCanvas({
    parentContainerRef,
    canvasParentSize,
    setScale,
    setPosition,
    paddingFactor: 0.6,
  });

  // Clear Active Layer
  useEffect(() => {
    if (tool === 'transparency' && activeLayer) {
      updateLayer([], []);
      setTool('pen');
    }
  }, [tool, activeLayer, updateLayer, setTool]);

  // Crop effects
  useEffect(() => {
    if (tool === 'crop' && useCrop.cropRect.visible && transformerRef.current && cropRectRef.current) {
      transformerRef.current.nodes([cropRectRef.current]);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [tool, useCrop.cropRect.visible]);

  useEffect(() => {
    if (!transformerRef.current) return;
    if (useCrop.cropRect.visible && cropRectRef.current) {
      transformerRef.current.nodes([cropRectRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [useCrop.cropRect.visible]);

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
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ cursor: tool === 'crop' ? 'crosshair' : tool === 'hand' ? 'grab' : tool === 'move' ? 'move' : 'none' }}
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
        {/* Слой для crop прямоугольника и трансформера */}
        <Layer>
          {useCrop.cropRect.visible && (
            <CropRender cropRectRef={cropRectRef} useCrop={useCrop} tool={tool} transformerRef={transformerRef} />
          )}
        </Layer>
        {/* Отдельный слой для курсора */}
        <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color}></CursorRender>
      </Stage>
      {/* Кнопка для применения crop */}
      {useCrop.cropRect.visible && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <button
            onClick={() =>
              useCrop.applyCrop((cropArea, operation) =>
                handleApplyCrop({
                  cropArea,
                  operation,
                  layers,
                  setLayers,
                  centerCanvas,
                  canvasSize,
                })
              )
            }
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {useCrop.cropRect.x < 0 ||
            useCrop.cropRect.y < 0 ||
            useCrop.cropRect.x + useCrop.cropRect.width > canvasSize.width ||
            useCrop.cropRect.y + useCrop.cropRect.height > canvasSize.height
              ? 'Extend Canvas'
              : 'Обрезать'}
          </button>
        </div>
      )}
    </div>
  );
};
