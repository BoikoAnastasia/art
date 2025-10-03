import { useLayers } from '../contexts/LayersContext';
import { pointInsidePolygon } from '../utils/PointInsidePolygon';
import { FilledShape, Point } from '../types/share';

export const useFill = () => {
  const { layers, activeLayerId, updateLayer } = useLayers();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const fillAtPoint = (clickPos: Point, color: string, lassoPoints: number[] = []) => {
    if (!activeLayer) return;
    console.log(clickPos, lassoPoints);
    let newShape: FilledShape;
    if (lassoPoints.length > 0 && pointInsidePolygon(clickPos, lassoPoints)) {
      newShape = { points: [...lassoPoints], fill: color, closed: true };
    } else {
      newShape = { points: [0, 0], fill: color, closed: false };
    }

    const updatedShapes = [...(activeLayer.filledShapes || []), newShape];
    updateLayer(activeLayer.lines, updatedShapes);
  };

  return { fillAtPoint };
};
