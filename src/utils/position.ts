import { Point } from '../types/share';

export const getStagePosFromClient = (
  client: { clientX: number; clientY: number },
  parentContainerRef: React.RefObject<HTMLDivElement | null>,
  scale: number,
  position: Point
) => {
  if (!parentContainerRef?.current) return { x: 0, y: 0 };
  const rect = parentContainerRef.current.getBoundingClientRect();
  const x = (client.clientX - rect.left - position.x) / scale;
  const y = (client.clientY - rect.top - position.y) / scale;
  return { x, y };
};

export const toLogicalPos = (
  pos: { x: number; y: number },
  flip: { flipX: boolean; flipY: boolean },
  canvasParentSize: { width: number; height: number }
) => {
  if (!pos) return pos;
  return {
    x: flip.flipX ? canvasParentSize.width - pos.x : pos.x,
    y: flip.flipY ? canvasParentSize.height - pos.y : pos.y,
  };
};
