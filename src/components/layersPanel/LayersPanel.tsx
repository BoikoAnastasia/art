import { Box, Button, IconButton } from '@mui/material';
import { useLayers } from '../../contexts/LayersContext';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/Delete';

export const LayersPanel = () => {
  const { layers, activeLayerId, setActiveLayerId, addLayer, removeLayer } = useLayers();

  return (
    <Box
      sx={{
        position: 'absolute',
        height: '50px',
        background: '#232323',
        borderTop: '1px solid #4c4c4cff',
        display: 'flex',
        alignItems: 'center',
        zIndex: 4,
        width: 'calc(100% - 250px)',
        bottom: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexFlow: 'row nowrap',
          gap: '10px',
          margin: '0 60px',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          '&::-webkit-scrollbar': {
            height: '5px',
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
        {layers.map((layer: any) => {
          const isActive = layer.id === activeLayerId;
          const isOnlyOne = layers.length === 1;

          return (
            <Button
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              sx={{
                display: 'inline-flex',
                gap: '5px',
                alignItems: 'center',
                background: isActive ? '#4c4c4cff' : 'transparent',
                color: 'white',
                padding: '4px 12px',
                minWidth: '80px',
                textTransform: 'none',
                '&:hover': {
                  background: isActive ? '#4c4c4cff' : '#333333',
                },
              }}
            >
              {layer.name}
              <IconButton
                disabled={isOnlyOne}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
                sx={{
                  background: 'transparent',
                  color: isOnlyOne ? '#666' : 'white',
                  padding: '2px',
                  pointerEvents: isOnlyOne ? 'none' : 'auto',
                }}
              >
                <DeleteIcon
                  sx={{
                    color: 'white',
                  }}
                />
              </IconButton>
            </Button>
          );
        })}

        <Button
          onClick={() => addLayer()}
          sx={{
            minWidth: '40px',
            padding: '4px',
            background: 'transparent',
            '&:hover': { background: '#333' },
          }}
        >
          <LibraryAddIcon sx={{ color: 'white' }} />
        </Button>
      </Box>
    </Box>
  );
};
