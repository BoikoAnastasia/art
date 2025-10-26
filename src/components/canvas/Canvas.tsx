import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage } from 'react-konva';

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
import { CanvasType, Point } from '../../types/share';
import { useCenteringCanvas } from '../../hooks/useCenteringCanvas';
import { useCropHook } from '../../hooks/useCrop';

import { Transformer } from 'react-konva';
import { Transformer as TransformerType } from 'konva/lib/shapes/Transformer';
import { Rect as RectType } from 'konva/lib/shapes/Rect';
import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';

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
  const { layers, activeLayerId, updateLayer, commit, canvasSize, updateCanvasSize } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const transformerRef = useRef<TransformerType>(null);
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

  useEffect(() => {
    if (tool === 'crop' && useCrop.cropRect.visible && transformerRef.current && cropRectRef.current) {
      transformerRef.current.nodes([cropRectRef.current]);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [tool, useCrop.cropRect.visible]);

  const handleTransformEnd = (e: any) => {
    if (tool !== 'crop') return;

    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    useCrop.setCropRect((prev) => ({
      ...prev,
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    }));
  };

  // Функция для применения crop ко всем слоям
  const handleApplyCrop = (cropArea: any, operation: 'crop' | 'extend') => {
    console.log(`Applying ${operation}:`, cropArea);

    if (operation === 'crop') {
      applyCropOperation(cropArea);
    } else {
      applyExtendOperation(cropArea);
    }
  };

  // Логика обрезки
  const applyCropOperation = (cropArea: any) => {
    const newCanvasSize = {
      width: cropArea.width,
      height: cropArea.height,
    };

    // Обновляем каждый слой - СМЕЩАЕМ координаты относительно области обрезки
    layers.forEach((layer) => {
      // Обрезаем линии - СМЕЩАЕМ точки
      const croppedLines = layer.lines
        ?.map((line) => ({
          ...line,
          points: line.points.map((point: Point) => ({
            x: point.x - cropArea.x,
            y: point.y - cropArea.y,
          })),
        }))
        .filter((line) => {
          // Фильтруем линии, которые полностью вне зоны обрезки
          return line.points.some(
            (point: Point) => point.x >= 0 && point.x <= cropArea.width && point.y >= 0 && point.y <= cropArea.height
          );
        });

      // Обрезаем заполненные фигуры - СМЕЩАЕМ точки
      const croppedFilledShapes = layer.filledShapes
        ?.map((shape) => {
          if (shape.closed) {
            return {
              ...shape,
              points: shape.points.map((point: any) => ({
                x: point.x - cropArea.x,
                y: point.y - cropArea.y,
              })),
            };
          }
          return shape;
        })
        .filter((shape) => {
          if (shape.closed) {
            return shape.points.some(
              (point: any) => point.x >= 0 && point.x <= cropArea.width && point.y >= 0 && point.y <= cropArea.height
            );
          }
          return true;
        });

      updateLayer(croppedLines || [], croppedFilledShapes || []);
    });

    updateCanvasSize(newCanvasSize);
    commit();
    centerCanvas(newCanvasSize);
  };

  // Логика расширения холста
  const applyExtendOperation = (extendArea: any) => {
    // Вычисляем новый размер холста
    const newWidth = Math.max(canvasSize.width, extendArea.x + extendArea.width);
    const newHeight = Math.max(canvasSize.height, extendArea.y + extendArea.height);

    const newCanvasSize = {
      width: newWidth,
      height: newHeight,
    };

    // Смещаем существующие слои если нужно
    const offsetX = extendArea.x < 0 ? Math.abs(extendArea.x) : 0;
    const offsetY = extendArea.y < 0 ? Math.abs(extendArea.y) : 0;

    if (offsetX > 0 || offsetY > 0) {
      layers.forEach((layer) => {
        // Смещаем линии
        const offsetLines = layer.lines?.map((line) => ({
          ...line,
          points: line.points.map((point: Point) => ({
            x: point.x + offsetX,
            y: point.y + offsetY,
          })),
        }));

        // Смещаем заполненные фигуры
        const offsetFilledShapes = layer.filledShapes?.map((shape) => {
          if (shape.closed) {
            return {
              ...shape,
              points: shape.points.map((point: any) => ({
                x: point.x + offsetX,
                y: point.y + offsetY,
              })),
            };
          }
          return shape;
        });

        updateLayer(offsetLines || [], offsetFilledShapes || []);
      });
    }

    updateCanvasSize(newCanvasSize);
    commit();
    centerCanvas(newCanvasSize);
  };

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
            <>
              <Rect
                ref={cropRectRef}
                x={useCrop.cropRect.x}
                y={useCrop.cropRect.y}
                width={useCrop.cropRect.width}
                height={useCrop.cropRect.height}
                fill="rgba(0,0,0,0.2)"
                stroke="#000"
                strokeWidth={1}
                draggable={tool === 'crop'}
                onTransformEnd={handleTransformEnd}
                onDragEnd={(e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
                  useCrop.setCropRect((prev) => ({
                    ...prev,
                    x: e.target.x(),
                    y: e.target.y(),
                  }));
                }}
              />
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox: any, newBox: any) => {
                  // Limit resize
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </>
          )}
        </Layer>
        {/* Отдельный слой для курсора */}
        <CursorRender hoverPos={hoverPos} size={size} tool={tool} color={color}></CursorRender>
      </Stage>
      {/* Кнопка для применения crop */}
      {useCrop.cropRect.visible && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <button
            onClick={() => useCrop.applyCrop(handleApplyCrop)}
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
