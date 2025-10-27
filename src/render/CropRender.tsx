import { Rect, Transformer } from 'react-konva';
import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
// utils
import { handleTransformEnd } from '../utils/crop/handleTransformEnd';
// types
import { CropType, CropRenderType } from '../types/share';

export const CropRender = ({ cropRectRef, useCrop, tool, transformerRef }: CropRenderType) => {
  return (
    <>
      <Rect
        ref={cropRectRef}
        x={useCrop.cropRect.x}
        y={useCrop.cropRect.y}
        width={useCrop.cropRect.width}
        height={useCrop.cropRect.height}
        fill="rgba(0,0,0,0.2)"
        stroke="#000"
        strokeWidth={1}
        draggable={tool === 'crop'}
        onTransformEnd={(e: KonvaEventObject<Event, Node<NodeConfig>>) =>
          handleTransformEnd(e, tool, useCrop.setCropRect)
        }
        onDragEnd={(e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
          useCrop.setCropRect((prev: CropType) => ({
            ...prev,
            x: e.target.x(),
            y: e.target.y(),
          }));
        }}
      />
      <Transformer
        ref={transformerRef}
        boundBoxFunc={(oldBox: any, newBox: any) => {
          // Limit resize
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </>
  );
};
