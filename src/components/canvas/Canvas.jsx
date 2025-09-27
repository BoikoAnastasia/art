// Canvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import { useColor } from '../../contexts/ColorContext';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { useTool } from '../../contexts/ToolsContext';
import { useLasso } from '../../tools/useLasso';
import { useFill } from '../../tools/useFill';
import { useLayers } from '../../contexts/LayersContext';

export const Canvas = ({ parentWidth, parentHeight, parentContainerRef }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // context
  const { color, setColor } = useColor();
  const { size } = useSize();
  const { size: opacity } = useOpacity();
  const { tool, setTool } = useTool();
  const { layers, activeLayerId, updateLayer } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // state
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);

  // lasso
  const {
    lassoPoints,
    handleMouseDown: handleLassoDown,
    handleMouseMove: handleLassoMove,
    handleMouseUp: handleLassoUp,
  } = useLasso(tool);
  const { filledShapes, fillAtPoint } = useFill();

  const MIN_SCALE = 0.0002;
  const MAX_SCALE = 10000;

  // ---------- Zoom ----------
  const handleZoom = (e, zoomIn) => {
    e.preventDefault();
    e.stopPropagation();
    const oldScale = scale;
    const scaleBy = 1.1;
    const newScale = zoomIn ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

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
    if (!parentContainerRef.current) return;
    const handleWheel = (e) => {
      const parentRect = parentContainerRef.current.getBoundingClientRect();
      const isOverParent =
        e.clientX >= parentRect.left &&
        e.clientX <= parentRect.right &&
        e.clientY >= parentRect.top &&
        e.clientY <= parentRect.bottom;
      if (isOverParent) handleZoom(e, e.deltaY < 0);
    };

    const parentContainer = parentContainerRef.current;
    parentContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => parentContainer.removeEventListener('wheel', handleWheel);
  }, [scale, position, parentContainerRef]);

  // ---------- Mouse Handlers ----------
  const handleMouseDown = (e) => {
    if (!activeLayer) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === 'hand' || tool === 'loop') return;

    if (tool === 'fill') {
      fillAtPoint(pos, color, lassoPoints);
      return;
    }

    if (tool === 'lasso') {
      handleLassoDown(pos);
      return;
    }

    if (tool === 'colorize') {
      const canvas = stage.toCanvas();
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const [r, g, b, a] = pixel;
      const rgba = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      setColor(rgba);
      setTool('pen');
      return;
    }

    isDrawing.current = true;
    const newLine = { tool, size, color, opacity: opacity / 100, points: [pos.x, pos.y] };
    updateLayer([...activeLayer.lines, newLine], activeLayer.filledShapesLayer);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) setHoverPos(pos);

    if (tool === 'lasso') {
      handleLassoMove(pos);
      return;
    }

    if (!isDrawing.current || !activeLayer) return;

    const updatedLines = [...activeLayer.lines];
    const lastLine = updatedLines[updatedLines.length - 1];
    if (lastLine) {
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      updateLayer(updatedLines, activeLayer.filledShapesLayer);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'lasso') {
      handleLassoUp();
      return;
    }
    isDrawing.current = false;
  };

  // ---------- Drag Canvas ----------
  const handleContainerMouseDown = (e) => {
    if (tool !== 'hand') return;
    setIsDraggingContainer(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleContainerMouseMove = (e) => {
    if (!isDraggingContainer || tool !== 'hand') return;
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };

  const handleContainerMouseUp = () => {
    setIsDraggingContainer(false);
  };

  useEffect(() => {
    if (!isDraggingContainer) return;
    const handleMove = (e) => handleContainerMouseMove(e);
    const handleUp = () => handleContainerMouseUp();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingContainer, tool]);

  // ---------- Clear Active Layer ----------
  useEffect(() => {
    if (tool === 'transparency' && activeLayer) {
      updateLayer([], []);
      setTool('pen');
    }
  }, [tool, activeLayer]);

  // ---------- Render ----------
  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
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
        ref={stageRef}
        width={parentWidth}
        height={parentHeight}
        style={{ cursor: tool === 'hand' ? 'grab' : 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {layers?.map((layer) => (
          <Layer key={layer.id}>
            {layer.filledShapesLayer?.map((shape, i) =>
              shape.closed ? (
                <Line key={i} points={shape.points} fill={shape.fill} closed />
              ) : (
                <Rect key={i} x={0} y={0} width={parentWidth} height={parentHeight} fill={shape.fill} />
              )
            )}
            {layer.lines?.map((line, i) => (
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
            ))}
            <Circle
              x={hoverPos.x}
              y={hoverPos.y}
              radius={(size || 10) / 2}
              stroke={tool === 'eraser' ? 'red' : color}
              strokeWidth={1}
            />
            {lassoPoints.length > 0 && <Line points={lassoPoints} stroke="#000" strokeWidth={1} closed dash={[4, 4]} />}
          </Layer>
        ))}

        {/* Hover Brush Circle */}
        {/* <Layer>
          <Circle
            x={hoverPos.x}
            y={hoverPos.y}
            radius={(size || 10) / 2}
            stroke={tool === 'eraser' ? 'red' : color}
            strokeWidth={1}
          />
          {lassoPoints.length > 0 && <Line points={lassoPoints} stroke="#000" strokeWidth={1} closed dash={[4, 4]} />}
        </Layer> */}
      </Stage>
    </div>
  );
};

//   return (
//     <div
//       ref={containerRef}
//       onMouseDown={(e) => {
//         handleContainerMouseDown(e); // твой drag
//       }}
//       style={{
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
//         transformOrigin: '0 0',
//         background: '#fff',
//       }}
//     >
//       <Stage
//         ref={stageRef}
//         style={{ cursor: tool === 'hand' ? 'grab' : 'none' }}
//         width={parentWidth}
//         height={parentHeight}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onTouchStart={handleMouseDown}
//         onTouchMove={handleMouseMove}
//         onTouchEnd={handleMouseUp}
//       >
//         <Layer>
//           {filledShapes.map((shape, i) =>
//             shape.closed ? (
//               <Line key={i} points={shape.points} fill={shape.fill} closed />
//             ) : (
//               <Rect key={i} x={0} y={0} width={parentWidth} height={parentHeight} fill={shape.fill} />
//             )
//           )}
//           {lines.map((line, i) => {
//             return (
//               <Line
//                 key={i}
//                 points={line.points}
//                 stroke={line.color}
//                 strokeWidth={line.size}
//                 tension={0.5}
//                 opacity={line.tool === 'eraser' ? 1 : line.opacity}
//                 lineCap="round"
//                 lineJoin="round"
//                 globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
//                 perfectDrawEnabled={false}
//               />
//             );
//           })}
//           <Circle
//             x={hoverPos.x}
//             y={hoverPos.y}
//             radius={(size || 10) / 2}
//             stroke={tool === 'eraser' ? 'red' : color}
//             strokeWidth={1}
//           />
//           {lassoPoints.length > 0 && (
//             <Line
//               // globalCompositeOperation="destination-out"
//               points={lassoPoints}
//               stroke="#000"
//               strokeWidth={1}
//               closed={true}
//               dash={[4, 4]}
//             />
//           )}
//         </Layer>
//       </Stage>
//     </div>
//   );
// };
