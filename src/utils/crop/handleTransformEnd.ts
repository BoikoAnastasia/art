import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
// types
import { CropType } from '../../types/share';

export const handleTransformEnd = (
  e: KonvaEventObject<Event, Node<NodeConfig>>,
  tool: string,
  setCropRect: React.Dispatch<React.SetStateAction<CropType>>
) => {
  if (tool !== 'crop') return;

  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // Reset scale
  node.scaleX(1);
  node.scaleY(1);

  setCropRect((prev) => ({
    ...prev,
    x: node.x(),
    y: node.y(),
    width: Math.max(5, node.width() * scaleX),
    height: Math.max(5, node.height() * scaleY),
  }));
};
