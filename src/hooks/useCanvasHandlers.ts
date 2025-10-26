// konva
import { KonvaEventObject } from 'konva/lib/Node';
// utils
import { toLogicalPos, getStagePosFromClient } from '../utils/position';
// types
import { UseCanvasHandlersType } from '../types/share';

// Вспомогательная функция для получения клиентских координат из события
const getClientCoordinates = (evt: MouseEvent | TouchEvent) => {
  if (evt instanceof MouseEvent) {
    return {
      clientX: evt.clientX,
      clientY: evt.clientY,
    };
  } else if (evt instanceof TouchEvent && evt.touches.length > 0) {
    return {
      clientX: evt.touches[0].clientX,
      clientY: evt.touches[0].clientY,
    };
  }
  return { clientX: 0, clientY: 0 };
};

export const useCanvasHandlers = ({
  tool,
  flip,
  canvasParentSize,
  parentContainerRef,
  setHoverPos,
  useDrawing,
  useTransform,
  useLasso,
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
}: UseCanvasHandlersType) => {
  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const visualPos = pos;
    const logicalPos = toLogicalPos(pos, flip, canvasParentSize);

    if (tool === 'crop') {
      useCrop.startCrop(visualPos);
      return;
    }

    if (tool === 'move') {
      useTransform.startMove(pos);
      return;
    }
    if (tool === 'pen' || tool === 'eraser') return useDrawing.startDrawing(pos, activeLayer);
    if (tool === 'lasso') return useLasso.handleMouseDown(logicalPos);
    if (tool === 'fill') {
      fillAtPoint(logicalPos, color, useLasso.lassoPoints);
      commit();
      return;
    }
    if (tool === 'colorize') {
      const ctx = stage?.toCanvas().getContext('2d');
      if (!ctx) return;
      const pixel = ctx.getImageData(visualPos.x, visualPos.y, 1, 1).data;
      const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
      setColor(rgba);
      setTool('pen');
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const client = getClientCoordinates(e.evt);
    const visualPos = getStagePosFromClient(client, parentContainerRef, scale, position);

    // Передаем ВИЗУАЛЬНЫЕ координаты для инверсии
    setHoverPos(visualPos);

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === 'crop') {
      useCrop.continueCrop(visualPos);
      return;
    }

    if (tool === 'move') {
      if (useTransform.isMoving.current) {
        useTransform.continueMove(pos, setTempCanvasOffset, position, scale);
      }
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      // Преобразу  ем визуальные в логические для рисования
      const logicalPos = toLogicalPos(pos, flip, canvasParentSize);
      useDrawing.continueDrawing(logicalPos, activeLayer);
      return;
    }

    if (tool === 'lasso') {
      const logicalPos = toLogicalPos(pos, flip, canvasParentSize);
      useLasso.handleMouseMove(logicalPos);
      return;
    }
  };

  const handleMouseUp = () => {
    if (tool === 'crop') {
      useCrop.endCrop();
      return;
    }
    if (tool === 'pen' || tool === 'eraser') return useDrawing.endDrawing();
    if (tool === 'move') {
      useTransform.endMove();
      return;
    }
    if (tool === 'lasso') return useLasso.handleMouseUp();
  };

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};
