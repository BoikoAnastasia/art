import { ColorPicker } from '../colorPicker/ColorPicker';
import { CustomeSlider } from '../customeSlider/CustomeSlider';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';
import { StyledRightSideBarBox } from '../../StyledComponents';

export const RightSideBar = () => {
  return (
    <StyledRightSideBarBox>
      <ColorPicker />
      <CustomeSlider title="Размер" useValueContext={useSize} />
      <CustomeSlider title="Прозрачность" useValueContext={useOpacity} />
    </StyledRightSideBarBox>
  );
};
