import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// icons
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import BrushIcon from '@mui/icons-material/Brush';
import ColorizeIcon from '@mui/icons-material/Colorize';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import SearchIcon from '@mui/icons-material/Search';
import CropIcon from '@mui/icons-material/Crop';
import InterestsIcon from '@mui/icons-material/Interests';
import LoopIcon from '@mui/icons-material/Loop';
import BackHandIcon from '@mui/icons-material/BackHand';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';

// images
import Eraser from '../icons/eraser.png';
import Lasso from '../icons/lasso.png';
import Move from '../icons/move.png';
import Tourch from '../icons/torch.png';
import { useTool } from '../../contexts/ToolsContext';

export const LeftSideBar = () => {
  const { tool, setTool } = useTool();
  console.log(tool);
  const sidebarButtons = [
    { id: 'move', icon: Move, isIcon: false, action: () => setTool('move') },
    { id: 'lasso', icon: Lasso, isIcon: false, action: () => setTool('lasso') },
    { id: 'eraser', icon: Eraser, isIcon: false, action: () => setTool('eraser') },
    { id: 'torch', icon: Tourch, isIcon: false, action: () => setTool('torch') },
    { id: 'pen', icon: BrushIcon, isIcon: true, action: () => setTool('pen') },
    { id: 'fill', icon: FormatColorFillIcon, isIcon: true, action: () => setTool('fill') },
    { id: 'shape', icon: InterestsIcon, isIcon: true, action: () => setTool('shape') },
    { id: 'search', icon: SearchIcon, isIcon: true, action: () => setTool('search') },
    { id: 'loop', icon: LoopIcon, isIcon: true, action: () => setTool('loop') },
    { id: 'hand', icon: BackHandIcon, isIcon: true, action: () => setTool('hand') },
    { id: 'format', icon: FormatShapesIcon, isIcon: true, action: () => setTool('format') },
    { id: 'crop', icon: CropIcon, isIcon: true, action: () => setTool('crop') },
    { id: 'highlight', icon: HighlightAltIcon, isIcon: true, action: () => setTool('highlight') },
    { id: 'colorize', icon: ColorizeIcon, isIcon: true, action: () => setTool('colorize') },
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
