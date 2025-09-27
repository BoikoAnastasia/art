import styled from '@emotion/styled';
import { Box, Button, IconButton, Input, Menu, Slider } from '@mui/material';
import { IStyledButtonLayer } from './types/share';



// Slider
export const StyledSlider = styled(Slider)(() => ({
  flex: 1,
  color: 'grey.600',
  '& .MuiSlider-track': {
    backgroundColor: 'grey', // активная часть
    border: '1px solid grey',
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
}))

export const StyledInput = styled(Input)(() => ({
  flex: '0 1 42px',
  '& .MuiInputBase-input': {
    color: 'white',
    borderBottom: 'none',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      margin: 0,
    },
  }
}))

// Layers
export const StyledLayersBox = styled(Box)(() => ({
  position: 'absolute' as const,
  left: 0,
  bottom: 0,
  height: '50px',
  background: '#232323',
  borderTop: '1px solid #4c4c4cff',
  display: 'flex',
  alignItems: 'center',
  zIndex: 4,
  width: 'calc(100% - 250px)',
}))

export const StyledLayersBoxItems = styled(Box)(() => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  gap: '10px',
  margin: '0 60px',
  whiteSpace: 'nowrap',
  overflowX: 'auto' as const,
  overflowY: 'hidden'  as const,
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
}))

export const StyledButtonLayer = styled(Box, {
  shouldForwardProp: (propName) => propName !== 'isActive',
})<IStyledButtonLayer>(({isActive}) => ({
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
}))

// leftSidebar

export const StyledLeftSideBarBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
  width: '50px',
  padding: '10px 0',
  background: '#232323',
  borderRight: '1px solid #4c4c4cff',
  zIndex: 5,
  overflowY: 'auto' as const,
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
}))

// rightSidebar
export const StyledRightSideBarBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  width: '250px',
  background: '#232323',
  borderLeft: '1px solid #4c4c4cff',
  zIndex: 5,
  padding: '0 16px',
}))

export const StyledButtonTopSidebar = styled(Button)(() => ({
  display: 'inline-flex',
  gap: '5px',
  alignItems: 'center',
  background: 'transparent',
  color: 'white',
  padding: '4px 12px',
  minWidth: '80px',
  textTransform: 'none' as const,
  '&:hover': {
    background: '#4c4c4cff'
  },
  '&.MuiButton-root':{
    borderRadius: 0, 
  }
}))

export const StyledIconButton = styled(IconButton)(() => ({
  background: 'transparent',
  color: 'white',
  borderRadius: 0,
  '&:hover': {
    background: '#4c4c4cff'
  },
}))


export const StyledMenu = styled(Menu)(() => ({
  '& .MuiMenu-paper': {
    backgroundColor: '#232323', // фон самого меню
  },
  '& .MuiList-root': {
    backgroundColor: '#232323', // фон списка
    color: '##fff', // серый текст по умолчанию
  },
  '& .MuiMenuItem-root': {
    color: '#fff', // серый текст
    '&:hover': {
      backgroundColor: 'rgba(37, 37, 37, 1)323', // фон при наведении
      color: '#dadadaff', // текст при наведении
    },
  },
}))