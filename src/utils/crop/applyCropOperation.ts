import { ApplyCropOperationType, Point } from '../../types/share';

export const applyCropOperation = ({ cropArea, layers, centerCanvas, setLayers }: ApplyCropOperationType) => {
  const newCanvasSize = {
    width: Math.round(cropArea.width),
    height: Math.round(cropArea.height),
  };

  const newLayers = layers.map((layer) => {
    const croppedLines =
      layer.lines
        ?.map((line) => ({
          ...line,
          points: line.points.map((point: Point) => ({
            x: Math.round(point.x - cropArea.x),
            y: Math.round(point.y - cropArea.y),
          })),
        }))
        .filter((line) =>
          line.points.some(
            (p: Point) => p.x >= 0 && p.x < newCanvasSize.width && p.y >= 0 && p.y < newCanvasSize.height
          )
        ) || [];

    const croppedFilledShapes =
      layer.filledShapes
        ?.map((shape) => {
          if (!shape.closed) return shape;
          return {
            ...shape,
            points: shape.points.map((point: any) => ({
              x: Math.round(point.x - cropArea.x),
              y: Math.round(point.y - cropArea.y),
            })),
          };
        })
        .filter((shape) => {
          if (!shape.closed) return true;
          return shape.points.some(
            (p: any) => p.x >= 0 && p.x < newCanvasSize.width && p.y >= 0 && p.y < newCanvasSize.height
          );
        }) || [];

    return {
      ...layer,
      lines: croppedLines,
      filledShapes: croppedFilledShapes,
    };
  });
  setLayers(newLayers, newCanvasSize);
  setTimeout(() => {
    centerCanvas(newCanvasSize);
  }, 0);
};
