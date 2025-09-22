import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
// icons
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import CreateIcon from '@mui/icons-material/Create';
import BrushIcon from '@mui/icons-material/Brush';
import ColorizeIcon from '@mui/icons-material/Colorize';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import RectangleIcon from '@mui/icons-material/Rectangle';
import SearchIcon from '@mui/icons-material/Search';
import CropIcon from '@mui/icons-material/Crop';
import TitleIcon from '@mui/icons-material/Title';
import InterestsIcon from '@mui/icons-material/Interests';
import LoopIcon from '@mui/icons-material/Loop';
import CircleIcon from '@mui/icons-material/Circle';
import BackHandIcon from '@mui/icons-material/BackHand';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
// images
import CircleDashed from '../icons/circle-dashed.png';
import Eraser from '../icons/eraser.png';
import Lasso from '../icons/lasso.png';
import Move from '../icons/move.png';
import Select from '../icons/select.png';

export const LeftSideBar = () => {
  const icons = [
    FormatShapesIcon,
    CropIcon,
    HighlightAltIcon,
    ColorizeIcon,
    CreateIcon,
    BrushIcon,
    FormatColorFillIcon,
    TitleIcon,
    CircleIcon,
    RectangleIcon,
    InterestsIcon,
    SearchIcon,
    LoopIcon,
    BackHandIcon,
  ];
  const images = [Move, Lasso, CircleDashed, Select, Eraser];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '50px',
        padding: '10px 0',
        background: '#232323',
        borderRight: '1px solid #4c4c4cff',
        zIndex: 5,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#4c4c4cff', // фон трека
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#dad7d7ff', // цвет ползунка
          borderRadius: '5px',
          border: 'none', // отступ вокруг ползунка
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#4c4c4cff', // при наведении
        },
      }}
    >
      {images.map((imgSrc, index) => (
        <IconButton key={index} size="small">
          <img src={imgSrc} alt={`icon-${index}`} style={{ width: '24px', height: '24px' }} />
        </IconButton>
      ))}
      {icons.map((Icon, index) => (
        <IconButton key={index} size="small" sx={{ color: 'white' }}>
          <Icon />
        </IconButton>
      ))}
    </Box>
  );
};
