import { useEffect } from 'react';
import { useCanvasZoomType } from '../types/share';

export const useCanvasZoom = ({ scale, position, setScale, setPosition, parentContainerRef }: useCanvasZoomType) => {
  const MIN_SCALE = 0.0002;
  const MAX_SCALE = 10000;

  const handleZoom = (e: WheelEvent, zoomIn: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    const oldScale = scale;
    const scaleBy = 1.1;
    const newScale = zoomIn ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    if (!parentContainerRef || !parentContainerRef.current) return;
    const parentRect = parentContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - parentRect.left;
    const mouseY = e.clientY - parentRect.top;

    const scaleFactor = limitedScale / oldScale;
    const newX = mouseX - (mouseX - position.x) * scaleFactor;
    const newY = mouseY - (mouseY - position.y) * scaleFactor;

    setScale(limitedScale);
    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!parentContainerRef || !parentContainerRef.current) return;
      const parentRect = parentContainerRef.current.getBoundingClientRect();
      const isOverParent =
        e.clientX >= parentRect.left &&
        e.clientX <= parentRect.right &&
        e.clientY >= parentRect.top &&
        e.clientY <= parentRect.bottom;
      if (isOverParent) handleZoom(e, e.deltaY < 0);
    };

    if (!parentContainerRef || !parentContainerRef.current) return;
    const parentContainer = parentContainerRef.current;
    parentContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => parentContainer.removeEventListener('wheel', handleWheel);
  }, [scale, position, parentContainerRef]);

  return {};
};
