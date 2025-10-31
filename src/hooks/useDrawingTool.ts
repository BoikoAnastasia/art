import { useRef } from 'react';
// utils
import { toLogicalPos } from '../utils/position';
import { SwitchBrush } from '../utils/switchBrush';
// types
import { LayerType, Point, UseDrawingToolType } from '../types/share';

export const useDrawingTool = ({
  tool,
  brush,
  color,
  opacity,
  size,
  flip,
  canvasParentSize,
  stageRef,
  updateLayer,
  commit,
}: UseDrawingToolType) => {
  const isDrawing = useRef(false);
  const startDrawing = (pos: Point, activeLayer: LayerType) => {
    if (!activeLayer) return;
    isDrawing.current = true;
    const logicalPos = toLogicalPos(pos, flip, canvasParentSize);
    const newStroke = {
      tool: tool,
      brush,
      size,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      opacity: tool === 'eraser' ? 1 : opacity / 100,
      points: [logicalPos],
      brushState: {},
    };
    updateLayer([...activeLayer.lines, newStroke], activeLayer.filledShapes, { commit: false });
  };

  const continueDrawing = (logicalPos: Point, activeLayer: LayerType) => {
    if (!isDrawing.current || !activeLayer) return;
    const updatedLines = [...activeLayer.lines];
    const lastStroke = updatedLines[updatedLines.length - 1];
    if (!lastStroke) return;

    const points = lastStroke.points;
    if (!points || points.length === 0) return;

    const prevPoint = points[points.length - 1];
    const brushFunc = SwitchBrush(brush);
    const brushState = lastStroke.brushState || {};

    if (tool === 'pen') {
      const ctx = stageRef.current.getStage().toCanvas().getContext('2d');
      if (ctx && prevPoint && logicalPos) {
        lastStroke.brushState = brushFunc(ctx, {
          start: prevPoint,
          end: logicalPos,
          color: lastStroke.color,
          size: lastStroke.size,
          state: brushState,
          opacity: opacity,
        });
      }
    }

    points.push(logicalPos);
    updateLayer(updatedLines, activeLayer.filledShapes, { commit: false });
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    commit();
    isDrawing.current = false;
  };
  return { startDrawing, continueDrawing, endDrawing, isDrawing };
};
