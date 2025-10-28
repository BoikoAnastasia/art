import React, { useEffect, useRef, useState } from 'react';
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
import { useDrawingToolKonva } from '../../hooks/useDrawingToolKonva';

export const Canvas = ({ canvasParentSize, parentContainerRef }: CanvasType) => {
  // refs
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const cropRectRef = useRef<any>(null);
  const tempLayerRef = useRef<Konva.Layer | null>(null);

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
  const drawing = useDrawingToolKonva({
    tool,
    brush,
    color,
    opacity,
    size,
    flip,
    canvasParentSize,
    stageRef: tempLayerRef,
    updateLayer,
    commit,
    layers,
    activeLayerId,
    canvasRef,
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
  const mouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (activeLayer) drawing.startDrawing(point);
  };

  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (activeLayer) drawing.continueDrawing(point);
    setHoverPos(point);
  };

  const mouseUp = () => {
    drawing.endDrawing();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ cursor: tool === 'hand' ? 'grab' : 'crosshair', background: '#fff' }}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />

      {/* Отрисовка слоёв через Konva только для UI */}
      {layers.map((layer) => (
        <LayerRenderer
          key={layer.id}
          layer={layer}
          tempCanvasOffset={{ x: 0, y: 0 }}
          flip={flip}
          parent={canvasParentSize}
          lassoPoints={lasso.lassoPoints}
        />
      ))}

      {/* Crop */}
      {useCrop.cropRect.visible && (
        <CropRender cropRectRef={cropRectRef} useCrop={useCrop} tool={tool} transformerRef={transformerRef} />
      )}

      {/* Курсор */}
      <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color} />
    </div>
  );
};
