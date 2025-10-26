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

// images
import Eraser from '../icons/eraser.png';
import Lasso from '../icons/lasso.png';
import Move from '../icons/move.png';
import Tourch from '../icons/torch.png';
import Transparency from '../icons/transparency.png';
import { useTool } from '../../contexts/ToolsContext';
import { StyledLeftSideBarBox } from '../../StyledComponents';
import { Tooltip } from '@mui/material';

export const LeftSideBar = () => {
  const { tool, setTool } = useTool();
  const sidebarButtons = [
    { id: 'move', icon: Move, isIcon: false, action: () => setTool('move'), disabled: false, tooltipe: 'Перетащить' },
    { id: 'lasso', icon: Lasso, isIcon: false, action: () => setTool('lasso'), disabled: false, tooltipe: 'Лассо' },
    { id: 'eraser', icon: Eraser, isIcon: false, action: () => setTool('eraser'), disabled: false, tooltipe: 'Ластик' },
    { id: 'blur', icon: Tourch, isIcon: false, action: () => setTool('blur'), disabled: true, tooltipe: 'Блюр' },
    { id: 'pen', icon: BrushIcon, isIcon: true, action: () => setTool('pen'), disabled: false, tooltipe: 'Рисование' },
    {
      id: 'fill',
      icon: FormatColorFillIcon,
      isIcon: true,
      action: () => setTool('fill'),
      disabled: false,
      tooltipe: 'Заливка',
    },
    {
      id: 'shape',
      icon: InterestsIcon,
      isIcon: true,
      action: () => setTool('shape'),
      disabled: true,
      tooltipe: 'Формы',
    },
    {
      id: 'loop',
      icon: LoopIcon,
      isIcon: true,
      action: () => setTool('loop'),
      disabled: true,
      tooltipe: 'Перевернуть',
    },
    {
      id: 'hand',
      icon: BackHandIcon,
      isIcon: true,
      action: () => setTool('hand'),
      disabled: false,
      tooltipe: 'Перемещение хоста',
    },
    {
      id: 'format',
      icon: FormatShapesIcon,
      isIcon: true,
      action: () => setTool('format'),
      disabled: true,
      tooltipe: 'Изменить форму',
    },
    { id: 'crop', icon: CropIcon, isIcon: true, action: () => setTool('crop'), disabled: false, tooltipe: 'Обрезать' },
    {
      id: 'highlight',
      icon: HighlightAltIcon,
      isIcon: true,
      action: () => setTool('highlight'),
      disabled: true,
      tooltipe: 'Изменить форму',
    },
    {
      id: 'colorize',
      icon: ColorizeIcon,
      isIcon: true,
      action: () => setTool('colorize'),
      disabled: false,
      tooltipe: 'Пипетка',
    },
    {
      id: 'transparency',
      icon: Transparency,
      isIcon: false,
      action: () => setTool('transparency'),
      disabled: false,
      tooltipe: 'Очистить слой',
    },
  ];

  return (
    <StyledLeftSideBarBox>
      {sidebarButtons.map((item) => (
        <Tooltip title={item.tooltipe} key={item.id}>
          <IconButton
            disabled={item.disabled}
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
        </Tooltip>
      ))}
    </StyledLeftSideBarBox>
  );
};
