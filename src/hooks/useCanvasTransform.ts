import { useRef } from 'react';
import { Point, useCanvasTransformType } from '../types/share';
import { applyCanvasOffsetToLayers } from '../utils/canvasOffset';

export const useCanvasTransform = ({
  tool,
  layers,
  tempCanvasOffset,
  updateLayer,
  setTempCanvasOffset,
}: useCanvasTransformType) => {
  const moveStart = useRef<Point>({ x: 0, y: 0 });
  const isMoving = useRef<boolean>(false);

  const startMove = (pos: Point) => {
    if (tool !== 'move') return;
    moveStart.current = pos;
    isMoving.current = true;
  };

  const continueMove = (pos: Point, setTempCanvasOffset: React.Dispatch<React.SetStateAction<Point>>) => {
    if (!isMoving.current) return;
    const dx = pos.x - moveStart.current.x;
    const dy = pos.y - moveStart.current.y;
    setTempCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    moveStart.current = pos;
  };

  const endMove = () => {
    if (!isMoving.current) return;
    applyCanvasOffsetToLayers({ layers, tempCanvasOffset, updateLayer, setTempCanvasOffset });
    isMoving.current = false;
  };
  return { startMove, continueMove, endMove, isMoving };
};
