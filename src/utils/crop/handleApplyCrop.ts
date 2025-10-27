// utils
import { applyCropOperation } from './applyCropOperation';
import { applyExtendOperation } from './applyExtendOperation';
// types
import { HandleApplyCropType } from '../../types/share';

export const handleApplyCrop = ({
  cropArea,
  operation,
  layers,
  centerCanvas,
  canvasSize,
  setLayers,
}: HandleApplyCropType) => {
  if (operation === 'crop') {
    applyCropOperation({ cropArea, layers, centerCanvas, canvasSize, setLayers });
  } else {
    applyExtendOperation({
      cropArea,
      layers,
      centerCanvas,
      canvasSize,
      setLayers,
    });
  }
};
