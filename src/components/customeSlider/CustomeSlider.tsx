import * as React from 'react';
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiInput from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
// context
// import { useSize } from '../../contexts/SizeContext';

const Input = styled(MuiInput)`
  width: 42px;
`;

export const CustomeSlider = ({ title, useValueContext }: { title: string; useValueContext: any }) => {
  const { size, setSize } = useValueContext();

  const handleSliderChange = (event: Event, newValue: number) => {
    setSize(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (size < 0) {
      setSize(0);
    } else if (size > 100) {
      setSize(100);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Typography id="input-slider" sx={{ color: '#848684', fontSize: '12px' }}>
        {title}
      </Typography>
      <Slider
        sx={{
          flex: 1,
          color: 'grey.600', // дефолтный цвет трека
          '& .MuiSlider-track': {
            backgroundColor: 'grey', // активная часть
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'grey', // фон
          },
          '& .MuiSlider-thumb': {
            width: 13,
            height: 13,
            backgroundColor: 'grey', // обычный цвет
            '&:hover, &.Mui-focusVisible, &.Mui-active': {
              boxShadow: 'none',
              backgroundColor: 'white', // при наведении / фокусе / клике
            },
          },
        }}
        value={typeof size === 'number' ? size : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
      />
      <Input
        sx={{
          flex: '0 1 42px',
          '& .MuiInputBase-input': {
            color: 'white',
            borderBottom: 'none',
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '&[type=number]': {
              MozAppearance: 'textfield',
            },
          },
        }}
        disableUnderline
        value={typeof size === 'number' ? size : 5}
        size="small"
        onChange={handleInputChange}
        onBlur={handleBlur}
        inputProps={{
          step: 1,
          min: 0,
          max: 100,
          type: 'number',
          'aria-labelledby': 'input-slider',
        }}
      />
    </Box>
  );
};
