import { Button, IconButton } from '@mui/material';
import { useLayers } from '../../contexts/LayersContext';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledButtonLayer, StyledLayersBox, StyledLayersBoxItems } from '../../StyledComponents';
import { LayerType } from '../../types/share';

export const LayersPanel = () => {
  const { layers, activeLayerId, setActiveLayerId, addLayer, removeLayer } = useLayers();

  return (
    <StyledLayersBox>
      <StyledLayersBoxItems>
        {layers.map((layer: LayerType) => {
          const isActive = layer.id === activeLayerId;
          const isOnlyOne = layers.length === 1;

          return (
            <StyledButtonLayer key={layer.id} onClick={() => setActiveLayerId(layer.id)} isActive={isActive}>
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
            </StyledButtonLayer>
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
      </StyledLayersBoxItems>
    </StyledLayersBox>
  );
};
