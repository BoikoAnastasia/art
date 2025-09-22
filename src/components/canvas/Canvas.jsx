// Canvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useColor } from '../../contexts/ColorContext';
import { useSize } from '../../contexts/SizeContext';

export const Canvas = ({ parentWidth, parentHeight, parentContainerRef }) => {
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const containerRef = useRef(null);
  const { color } = useColor();
  const { size } = useSize();

  const MIN_SCALE = 0.0002;
  const MAX_SCALE = 10000;
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Обработчик масштабирования с учетом позиции курсора
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleZoom = (e, zoomIn) => {
    e.preventDefault();
    e.stopPropagation();

    const oldScale = scale;
    const scaleBy = 1.1;
    const newScale = zoomIn ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

    // Получаем позицию курсора относительно родительского контейнера
    const parentRect = parentContainerRef.current.getBoundingClientRect();

    // Координаты курсора относительно родительского контейнера
    const mouseX = e.clientX - parentRect.left;
    const mouseY = e.clientY - parentRect.top;

    // Вычисляем новую позицию для масштабирования относительно курсора
    const scaleFactor = limitedScale / oldScale;
    const newX = mouseX - (mouseX - position.x) * scaleFactor;
    const newY = mouseY - (mouseY - position.y) * scaleFactor;

    setScale(limitedScale);
    setPosition({ x: newX, y: newY });
  };

  // Обработчик колесика мыши для родительского контейнера
  useEffect(() => {
    if (!parentContainerRef.current) return;

    const handleWheel = (e) => {
      // Проверяем, что событие произошло в области родительского контейнера
      const parentRect = parentContainerRef.current.getBoundingClientRect();
      const isOverParent =
        e.clientX >= parentRect.left &&
        e.clientX <= parentRect.right &&
        e.clientY >= parentRect.top &&
        e.clientY <= parentRect.bottom;

      if (isOverParent) {
        const zoomIn = e.deltaY < 0;
        handleZoom(e, zoomIn);
      }
    };

    const parentContainer = parentContainerRef.current;
    parentContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      parentContainer.removeEventListener('wheel', handleWheel);
    };
  }, [scale, position, parentContainerRef, handleZoom]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setLines([...lines, { tool, size, color, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const updatedLines = [...lines];
    const lastLine = updatedLines[updatedLines.length - 1];

    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      updatedLines.splice(updatedLines.length - 1, 1, lastLine);
      setLines(updatedLines);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: '0 0',
      }}
    >
      <Stage
        width={parentWidth}
        height={parentHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          <Rect x={0} y={0} width={parentWidth} height={parentHeight} fill="#ffffffff" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size || 10}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
