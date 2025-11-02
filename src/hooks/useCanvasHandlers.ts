// utils
import { toLogicalPos } from '../utils/position';
// types
import { UseCanvasHandlersType } from '../types/share';

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
  canvasRef,
}: UseCanvasHandlersType & { canvasRef: React.RefObject<HTMLCanvasElement | null> }) => {
  /** Получение координат для pointer и touch */
  const getPoint = (e: PointerEvent | TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement | MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };

    if (tool === 'crop') return useCrop.startCrop(point);
    if (tool === 'move') return useTransform.startMove(point);
    if (tool === 'pen' || tool === 'eraser') {
      if (activeLayer) return useDrawing.startDrawing(point);
    }

    if (tool === 'lasso') return useLasso.handleMouseDown(point);

    if (tool === 'fill') {
      fillAtPoint(point, color, useLasso.lassoPoints);
      commit();
      return;
    }

    if (tool === 'colorize') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const x = Math.round(point.x);
      const y = Math.round(point.y);

      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
        setColor(rgba);
        setTool('pen');
      } catch (err) {
        console.warn('Color picker error:', err);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement | MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
    setHoverPos(point);

    if (tool === 'crop') return useCrop.continueCrop(point);

    if (tool === 'move' && useTransform.isMoving?.current)
      return useTransform.continueMove(point, setTempCanvasOffset, position, scale);

    if (tool === 'pen' || tool === 'eraser') {
      if (activeLayer) useDrawing.continueDrawing(point);
      setHoverPos(point);
      return;
    }

    if (tool === 'lasso') {
      const logicalPos = toLogicalPos(point, flip, canvasParentSize);
      useLasso.handleMouseMove(logicalPos);
      return;
    }
  };

  const handleMouseUp = () => {
    if (tool === 'crop') return useCrop.endCrop();
    if (tool === 'pen' || tool === 'eraser') return useDrawing.endDrawing();
    if (tool === 'move') return useTransform.endMove();
    if (tool === 'lasso') return useLasso.handleMouseUp();
  };

  // Points events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e.nativeEvent);
    if (!point) return;
    const pressure = e.pressure ?? 1;

    if (tool === 'crop') return useCrop.startCrop(point);
    if (tool === 'move') return useTransform.startMove(point);
    if (tool === 'pen' || tool === 'eraser') {
      if (activeLayer) useDrawing.startDrawing(point, pressure);
      return;
    }

    if (tool === 'lasso') return useLasso.handleMouseDown(point);
    if (tool === 'fill') {
      fillAtPoint(point, color, useLasso.lassoPoints);
      commit();
      return;
    }

    if (tool === 'colorize') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
        setColor(rgba);
        setTool('pen');
      } catch (err) {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e.nativeEvent);
    if (!point) return;
    setHoverPos(point);
    const pressure = e.pressure ?? 1;

    if (tool === 'crop') return useCrop.continueCrop(point);
    if (tool === 'move' && useTransform.isMoving?.current)
      return useTransform.continueMove(point, setTempCanvasOffset, position, scale);

    if (tool === 'pen' || tool === 'eraser') {
      if (activeLayer) useDrawing.continueDrawing(point, pressure);
      return;
    }

    if (tool === 'lasso') {
      const logicalPos = toLogicalPos(point, flip, canvasParentSize);
      useLasso.handleMouseMove(logicalPos);
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'crop') return useCrop.endCrop();
    if (tool === 'pen' || tool === 'eraser') return useDrawing.endDrawing();
    if (tool === 'move') return useTransform.endMove();
    if (tool === 'lasso') return useLasso.handleMouseUp();
  };

  //Touch event
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const point = getPoint(e.nativeEvent);
    if (!point) return;
    if (tool === 'pen' && activeLayer) useDrawing.startDrawing(point, 1);
    if (tool === 'crop') useCrop.startCrop(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const point = getPoint(e.nativeEvent);
    if (!point) return;
    setHoverPos(point);
    if (tool === 'pen' && activeLayer) useDrawing.continueDrawing(point, 1);
    if (tool === 'crop') useCrop.continueCrop(point);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (tool === 'pen') useDrawing.endDrawing();
    if (tool === 'crop') useCrop.endCrop();
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
