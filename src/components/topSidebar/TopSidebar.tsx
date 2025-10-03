import { useState } from 'react';
import { AppBar, Box, MenuItem, Toolbar } from '@mui/material';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { StyledButtonTopSidebar, StyledIconButton, StyledMenu } from '../../StyledComponents';
import { useFlip } from '../../contexts/FlipContext';
import { useLayers } from '../../contexts/LayersContext';

export const TopSidebar = () => {
  const [anchorElFile, setAnchorElFile] = useState<null | HTMLElement>(null);
  const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);

  const { setFlip } = useFlip();
  const { undo, redo, canUndo, canRedo } = useLayers();

  const openFile = Boolean(anchorElFile);
  const openEdit = Boolean(anchorElEdit);

  const handleClickFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFile(event.currentTarget);
  };
  const handleCloseFile = () => {
    setAnchorElFile(null);
  };

  const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElEdit(event.currentTarget);
  };
  const handleCloseEdit = () => {
    setAnchorElEdit(null);
  };

  const toggleFlip = (key: 'flipX' | 'flipY') => {
    setFlip((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppBar
      position="static"
      sx={{
        zIndex: 10,
        background: '#232323',
        borderBottom: '1px solid #4c4c4cff',
      }}
    >
      <Toolbar sx={{ '&.MuiToolbar-root': { minHeight: '50px', display: 'flex', gap: '5px' } }}>
        {/* Меню "Файл" */}
        <Box sx={{ boxShadow: 'none' }}>
          <StyledButtonTopSidebar
            id="file-button"
            aria-controls={openFile ? 'file-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openFile ? 'true' : undefined}
            onClick={handleClickFile}
          >
            Файл
          </StyledButtonTopSidebar>
          <StyledMenu
            id="file-menu"
            anchorEl={anchorElFile}
            open={openFile}
            onClose={handleCloseFile}
            slotProps={{
              list: {
                'aria-labelledby': 'file-button',
              },
            }}
          >
            <MenuItem onClick={handleCloseFile}>Новый</MenuItem>
            <MenuItem onClick={handleCloseFile}>Импортировать</MenuItem>
            <MenuItem onClick={handleCloseFile}>Сохранить</MenuItem>
          </StyledMenu>
        </Box>

        {/* Меню "Изменить" */}
        <Box sx={{ boxShadow: 'none' }}>
          <StyledButtonTopSidebar
            id="edit-button"
            aria-controls={openEdit ? 'edit-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openEdit ? 'true' : undefined}
            onClick={handleClickEdit}
          >
            Изменить
          </StyledButtonTopSidebar>
          <StyledMenu
            id="edit-menu"
            anchorEl={anchorElEdit}
            open={openEdit}
            onClose={handleCloseEdit}
            slotProps={{
              list: {
                'aria-labelledby': 'edit-button',
              },
            }}
          >
            <MenuItem onClick={handleCloseEdit}>Вырезать</MenuItem>
            <MenuItem onClick={handleCloseEdit}>Копировать</MenuItem>
            <MenuItem onClick={handleCloseEdit}>Вставить</MenuItem>
          </StyledMenu>
        </Box>

        {/* Иконки */}
        <StyledIconButton onClick={() => toggleFlip('flipX')}>
          <SwapHorizIcon />
        </StyledIconButton>
        <StyledIconButton onClick={() => toggleFlip('flipY')}>
          <SwapVertIcon />
        </StyledIconButton>
        <StyledIconButton onClick={() => undo()} disabled={!canUndo}>
          <UndoIcon />
        </StyledIconButton>
        <StyledIconButton onClick={() => redo()} disabled={!canRedo}>
          <RedoIcon />
        </StyledIconButton>
      </Toolbar>
    </AppBar>
  );
};
