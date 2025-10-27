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

    // 1) Единый путь: evt -> client -> visualPos (учитывает CSS трансформ контейнера)
    const client = getClientCoordinates(e.evt);
    const visualPos = getStagePosFromClient(client, parentContainerRef, scale, position);
    if (!visualPos) return;

    // 2) logicalPos — это только для рисования/лассо/филл (преобразованная по flip и т.п.)
    const logicalPos = toLogicalPos(visualPos, flip, canvasParentSize);

    if (tool === 'crop') {
      useCrop.startCrop(visualPos);
      return;
    }

    if (tool === 'move') {
      // Передаём visualPos (или адаптируйте useTransform, если он ожидал другой формат)
      useTransform.startMove(visualPos);
      return;
    }

    if (tool === 'pen' || tool === 'eraser') return useDrawing.startDrawing(logicalPos, activeLayer);

    if (tool === 'lasso') return useLasso.handleMouseDown(logicalPos);

    if (tool === 'fill') {
      fillAtPoint(logicalPos, color, useLasso.lassoPoints);
      commit();
      return;
    }

    if (tool === 'colorize') {
      // для colorize используем визуальную позицию (она в системе координат канвы)
      const ctx = stage?.toCanvas().getContext('2d');
      if (!ctx) return;
      const x = Math.round(visualPos.x);
      const y = Math.round(visualPos.y);
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
        setColor(rgba);
        setTool('pen');
      } catch (err) {}
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Всегда вычисляем visualPos через client (единая система)
    const client = getClientCoordinates(e.evt);
    const visualPos = getStagePosFromClient(client, parentContainerRef, scale, position);
    if (!visualPos) return;

    // Передаем ВИЗУАЛЬНЫЕ координаты для инверсии/курсорного рендера
    setHoverPos(visualPos);

    if (tool === 'crop') {
      useCrop.continueCrop(visualPos);
      return;
    }

    if (tool === 'move') {
      // useTransform ожидает продолжение перемещения — передаем visualPos
      if (useTransform.isMoving?.current) {
        useTransform.continueMove(visualPos, setTempCanvasOffset, position, scale);
      }
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      const logicalPos = toLogicalPos(visualPos, flip, canvasParentSize);
      useDrawing.continueDrawing(logicalPos, activeLayer);
      return;
    }

    if (tool === 'lasso') {
      const logicalPos = toLogicalPos(visualPos, flip, canvasParentSize);
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
