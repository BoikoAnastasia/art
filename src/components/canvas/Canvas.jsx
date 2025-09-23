// // Canvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import { useColor } from '../../contexts/ColorContext';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { useTool } from '../../contexts/ToolsContext';
import { useLasso } from '../../tools/Lasso';

export const Canvas = ({ parentWidth, parentHeight, parentContainerRef }) => {
  // refs
  const isDrawing = useRef(false);
  const containerRef = useRef(null);

  // state
  const [lines, setLines] = useState([]);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // context
  const { color } = useColor();
  const { size } = useSize();
  const { size: opacity } = useOpacity();
  const { tool } = useTool();

  const MIN_SCALE = 0.0002;
  const MAX_SCALE = 10000;

  // lasso
  const {
    lassoPoints,
    handleMouseDown: handleLassoDown,
    handleMouseMove: handleLassoMove,
    handleMouseUp: handleLassoUp,
  } = useLasso(tool);

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
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (tool === 'lasso') {
      handleLassoDown(pos);
      return;
    }

    isDrawing.current = true;
    setLines([...lines, { tool, size, color, opacity: opacity / 100, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) setHoverPos(pos);
    if (tool === 'lasso') {
      handleLassoMove(pos);
      return;
    }
    if (!isDrawing.current) return;
    const updatedLines = [...lines];
    const lastLine = updatedLines[updatedLines.length - 1];
    if (lastLine) {
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      updatedLines.splice(updatedLines.length - 1, 1, lastLine);
      setLines(updatedLines);
    }
    // setLines((prevLines) => {
    //   if (prevLines.length === 0) return prevLines;
    //   const lastLine = { ...prevLines[prevLines.length - 1] };
    //   lastLine.points = [...lastLine.points, point.x, point.y];
    //   return [...prevLines.slice(0, prevLines.length - 1), lastLine];
    // });
  };

  const handleMouseUp = () => {
    if (tool === 'lasso') {
      handleLassoUp();
      return;
    }
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
        background: '#fff',
      }}
    >
      <Stage
        style={{ cursor: 'none' }}
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
          <Rect x={0} y={0} width={parentWidth} height={parentHeight} />
          {lines.map((line, i) => {
            console.log(`Line ${i}:`, line.tool, line.color, line.size);
            return (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.size}
                tension={0.5}
                opacity={line.tool === 'eraser' ? 1 : line.opacity}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                perfectDrawEnabled={false}
              />
            );
          })}
          <Circle
            x={hoverPos.x}
            y={hoverPos.y}
            radius={(size || 10) / 2}
            stroke={tool === 'eraser' ? 'red' : color}
            strokeWidth={1}
          />
          {lassoPoints.length > 0 && (
            <Line points={lassoPoints} stroke="#000" strokeWidth={1} closed={true} dash={[4, 4]} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
