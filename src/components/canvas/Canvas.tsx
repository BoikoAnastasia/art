import React, { useEffect, useRef, useState } from 'react';
// konva
import Konva from 'konva';
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
import { useCanvasTransform } from '../../hooks/useCanvasTransform';
import { useCanvasHandlers } from '../../hooks/useCanvasHandlers';
import { useCropHook } from '../../hooks/useCrop';
import { useDrawingToolKonva } from '../../hooks/useDrawingToolKonva';
import { useCenteringCanvas } from '../../hooks/useCenteringCanvas';
// types
import { CanvasType } from '../../types/share';

export const Canvas = ({ canvasParentSize, parentContainerRef }: CanvasType) => {
  // refs
  const containerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const cropRectRef = useRef<Konva.Container | null>(null);
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
  const { layers, activeLayerId, updateLayer, commit, canvasSize, setLayers } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // tools
  const { fillAtPoint } = useFill();
  const lasso = useLasso(tool);
  // hooks
  const useCrop = useCropHook(canvasParentSize);

  //TODO
  // OPACITY, lasso, fill, brush, layers, reverse (flip), history, turn
  // hand mobile
  // mobile adaptive
  //lasso cursor, fill cursor

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
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasHandlers({
    tool,
    canvasRef,
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
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          cursor: tool === 'crop' ? 'crosshair' : tool === 'hand' ? 'grab' : tool === 'move' ? 'move' : 'none',
          touchAction: 'none',
        }}
        // Mouse event
        onMouseDown={(e: any) => handleMouseDown(e.nativeEvent)}
        onMouseMove={(e: any) => handleMouseMove(e.nativeEvent)}
        onMouseUp={handleMouseUp}
        // Pointer events (универсальные)
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerUp={handlePointerUp}
        // Touch fallback (для старых браузеров или iOS)
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={handleTouchEnd}
      />

      <LayerRenderer
        layers={layers}
        tempCanvasOffset={tempCanvasOffset}
        flip={flip}
        parent={canvasParentSize}
        lassoPoints={lasso.lassoPoints}
        canvasRef={canvasRef}
      />

      {/* Crop */}
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
      {useCrop.cropRect.visible && <CropRender useCrop={useCrop} tool={tool} canvasSize={canvasParentSize} />}
      {/* Курсор */}
      <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color} />
    </div>
  );
};
