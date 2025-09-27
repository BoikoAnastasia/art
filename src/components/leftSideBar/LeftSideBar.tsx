import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// icons
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import BrushIcon from '@mui/icons-material/Brush';
import ColorizeIcon from '@mui/icons-material/Colorize';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import CropIcon from '@mui/icons-material/Crop';
import InterestsIcon from '@mui/icons-material/Interests';
import LoopIcon from '@mui/icons-material/Loop';
import BackHandIcon from '@mui/icons-material/BackHand';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';

// images
import Eraser from '../icons/eraser.png';
import Lasso from '../icons/lasso.png';
import Move from '../icons/move.png';
import Tourch from '../icons/torch.png';
import Transparency from '../icons/transparency.png';
import { useTool } from '../../contexts/ToolsContext';

export const LeftSideBar = () => {
  const { tool, setTool } = useTool();
  const sidebarButtons = [
    { id: 'move', icon: Move, isIcon: false, action: () => setTool('move'), disabled: true },
    { id: 'lasso', icon: Lasso, isIcon: false, action: () => setTool('lasso'), disabled: false },
    { id: 'eraser', icon: Eraser, isIcon: false, action: () => setTool('eraser'), disabled: false },
    { id: 'blur', icon: Tourch, isIcon: false, action: () => setTool('blur'), disabled: true },
    { id: 'pen', icon: BrushIcon, isIcon: true, action: () => setTool('pen'), disabled: false },
    { id: 'fill', icon: FormatColorFillIcon, isIcon: true, action: () => setTool('fill'), disabled: false },
    { id: 'shape', icon: InterestsIcon, isIcon: true, action: () => setTool('shape'), disabled: true },
    { id: 'addLayer', icon: AddToPhotosIcon, isIcon: true, action: () => setTool('addLayer'), disabled: true },
    { id: 'loop', icon: LoopIcon, isIcon: true, action: () => setTool('loop'), disabled: true },
    { id: 'hand', icon: BackHandIcon, isIcon: true, action: () => setTool('hand'), disabled: false },
    { id: 'format', icon: FormatShapesIcon, isIcon: true, action: () => setTool('format'), disabled: true },
    { id: 'crop', icon: CropIcon, isIcon: true, action: () => setTool('crop'), disabled: true },
    { id: 'highlight', icon: HighlightAltIcon, isIcon: true, action: () => setTool('highlight'), disabled: true },
    { id: 'colorize', icon: ColorizeIcon, isIcon: true, action: () => setTool('colorize'), disabled: false },
    { id: 'transparency', icon: Transparency, isIcon: false, action: () => setTool('transparency'), disabled: false },
  ];

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
          background: '#4c4c4cff',
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#dad7d7ff',
          borderRadius: '5px',
          border: 'none',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#4c4c4cff',
        },
      }}
    >
      {sidebarButtons.map((item) => (
        <IconButton
          disabled={item.disabled}
          key={item.id}
          sx={{
            background: tool === item.id ? '#4c4c4c' : 'transparent',
            color: 'white',
            borderRadius: '0',
          }}
          size="small"
          onClick={item.action}
        >
          {item.isIcon ? (
            <item.icon />
          ) : (
            <img src={item.icon as string} alt={`icon-${item.id}`} style={{ width: '24px', height: '24px' }} />
          )}
        </IconButton>
      ))}
    </Box>
  );
};
