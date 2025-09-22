import Box from '@mui/material/Box';
import { ColorPicker } from '../colorPicker/ColorPicker';

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
      }}
    >
      <ColorPicker />
    </Box>
  );
};
