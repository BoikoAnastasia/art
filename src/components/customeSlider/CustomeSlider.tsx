import * as React from 'react';
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { StyledInput, StyledSlider } from '../../StyledComponents';

export const CustomeSlider = ({ title, useValueContext }: { title: string; useValueContext: any }) => {
  const { size, setSize } = useValueContext();

  const handleSliderChange = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    setSize(val);
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
      <StyledSlider
        value={typeof size === 'number' ? size : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
      />
      <StyledInput
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
