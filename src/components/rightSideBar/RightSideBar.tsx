import Box from '@mui/material/Box';
import { ColorPicker } from '../colorPicker/ColorPicker';
import { CustomeSlider } from '../customeSlider/CustomeSlider';
import { useSize } from '../../contexts/SizeContext';
import { useOpacity } from '../../contexts/OpacityContext';

export const RightSideBar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '250px',
        background: '#232323',
        borderLeft: '1px solid #4c4c4cff',
        zIndex: 5,
        padding: '0 16px',
      }}
    >
      <ColorPicker />
      <CustomeSlider title="Размер" useValueContext={useSize} />
      <CustomeSlider title="Прозрачность" useValueContext={useOpacity} />
    </Box>
  );
};
