import { SketchPicker } from 'react-color';
import { useColor } from '../../ColorContext';

export const ColorPicker = () => {
  const { color, setColor } = useColor();
  return <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />;
};
