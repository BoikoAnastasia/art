import { ApplyCropOperationType, Point } from '../../types/share';

export const applyExtendOperation = ({
  cropArea,
  layers,
  centerCanvas,
  canvasSize,
  setLayers,
}: ApplyCropOperationType) => {
  const newWidth = Math.max(canvasSize.width, cropArea.x + cropArea.width);
  const newHeight = Math.max(canvasSize.height, cropArea.y + cropArea.height);

  const newCanvasSize = {
    width: newWidth,
    height: newHeight,
  };

  const offsetX = cropArea.x < 0 ? Math.abs(cropArea.x) : 0;
  const offsetY = cropArea.y < 0 ? Math.abs(cropArea.y) : 0;

  const newLayers = layers.map((layer) => {
    const offsetLines =
      layer.lines?.map((line) => ({
        ...line,
        points: line.points.map((point: Point) => ({
          x: Math.round(point.x + offsetX),
          y: Math.round(point.y + offsetY),
        })),
      })) || [];

    const offsetFilledShapes =
      layer.filledShapes?.map((shape) => {
        if (shape.closed) {
          return {
            ...shape,
            points: shape.points.map((point: any) => ({
              x: Math.round(point.x + offsetX),
              y: Math.round(point.y + offsetY),
            })),
          };
        }
        return shape;
      }) || [];

    return {
      ...layer,
      lines: offsetLines,
      filledShapes: offsetFilledShapes,
    };
  });
  setLayers(newLayers, newCanvasSize);
  centerCanvas(newCanvasSize);
};
