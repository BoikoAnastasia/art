import { useEffect } from 'react';
import { UseCanvasDragType } from '../types/share';

export const useCanvasDrag = ({
  tool,
  isDraggingContainer,
  setIsDraggingContainer,
  position,
  dragOffset,
  setPosition,
}: UseCanvasDragType) => {
  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (tool !== 'hand') return;
    setIsDraggingContainer(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleContainerMouseMove = (e: MouseEvent) => {
    if (!isDraggingContainer || tool !== 'hand') return;
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };

  const handleContainerMouseUp = () => {
    setIsDraggingContainer(false);
  };

  useEffect(() => {
    if (!isDraggingContainer) return;
    const handleMove = (e: MouseEvent) => handleContainerMouseMove(e);
    const handleUp = () => handleContainerMouseUp();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingContainer, tool]);
  return { handleContainerMouseDown };
};
