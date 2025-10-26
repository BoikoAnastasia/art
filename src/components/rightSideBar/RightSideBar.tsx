import { ColorPicker } from '../colorPicker/ColorPicker';
import { CustomeSlider } from '../customeSlider/CustomeSlider';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { StyledRightSideBarBox } from '../../StyledComponents';
import { Button } from '@mui/material';
import { useBrush } from '../../contexts/BrushContext';
import { Brush } from '../../types/share';

export const RightSideBar = () => {
  const brushArr = [
    {
      id: 'pen',
      name: 'Карандаш',
    },
    { id: 'calligraphy', name: 'Калиграфическая кисть' },
    { id: 'blur', name: 'Блюр' },
    // { id: 'drip', name: 'Мокрая кисть' }, // TODO эта кисть не работает
    // { id: 'foam', name: 'Мыльная кисть' }, // TODO эта кисть не работает
  ];
  const { setBrush } = useBrush();
  return (
    <StyledRightSideBarBox>
      <ColorPicker />
      <CustomeSlider title="Размер" useValueContext={useSize} />
      <CustomeSlider title="Прозрачность" useValueContext={useOpacity} />
      {brushArr.map((brush) => (
        <Button key={brush.id} onClick={() => setBrush(brush.id as Brush)}>
          {brush.name}
        </Button>
      ))}
    </StyledRightSideBarBox>
  );
};
