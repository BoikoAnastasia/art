// MainPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Canvas } from '../../components/canvas/Canvas';
import Box from '@mui/material/Box';
import { RightSideBar } from '../../components/rightSideBar/RightSideBar';
import { LeftSideBar } from '../../components/leftSideBar/LeftSideBar';
import { LayersPanel } from '../../components/layersPanel/LayersPanel';
import { TopSidebar } from '../../components/topSidebar/TopSidebar';

// icons

// import SaveAltIcon from '@mui/icons-material/SaveAlt';
// import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
// import DeleteIcon from '@mui/icons-material/Delete';

export const MainPage = () => {
  const [canvasWidth, setCanvasWidth] = useState(800); // Начальная ширина холста
  const [canvasHeight, setCanvasHeight] = useState(600); // Начальная высота холста
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Функция для обновления размера контейнера холста
  const updateCanvasContainerSize = () => {
    if (canvasContainerRef.current) {
      const containerRect = canvasContainerRef.current.getBoundingClientRect();
      // Можно установить максимальные размеры или оставить фиксированными
      // setCanvasWidth(containerRect.width * 0.8); // 80% ширины контейнера
      // setCanvasHeight(containerRect.height * 0.8); // 80% высоты контейнера
    }
  };

  useEffect(() => {
    updateCanvasContainerSize();
    window.addEventListener('resize', updateCanvasContainerSize);

    return () => {
      window.removeEventListener('resize', updateCanvasContainerSize);
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Верхнее меню */}
      <TopSidebar />

      {/* Основное содержимое */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Левое меню */}
        <LeftSideBar />
        {/* Центральная область с холстом */}
        <Box
          ref={canvasContainerRef}
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: '#161616',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Canvas parentWidth={canvasWidth} parentHeight={canvasHeight} parentContainerRef={canvasContainerRef} />
        </Box>

        {/* Правое меню */}
        <RightSideBar />

        {/* Нижнее меню */}
        <LayersPanel />
      </Box>
    </Box>
  );
};
