import { Circle, Layer } from 'react-konva';
// types
import { CursorRenderType } from '../types/share';

export const CursorRender = ({ hoverPos, size, tool, color }: CursorRenderType) => {
  return (
    <Layer>
      <Circle
        x={hoverPos.x}
        y={hoverPos.y}
        radius={(size || 10) / 2}
        stroke={tool === 'pen' ? color : 'none'}
        strokeWidth={1}
      />
    </Layer>
  );
};
