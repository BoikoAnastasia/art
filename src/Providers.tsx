import React, { ReactNode, ReactElement, FC } from 'react';
import { ColorProvider } from './contexts/ColorContext';
import { SizeBrushProvider } from './contexts/SizeContext';
import { OpacityContextProvider } from './contexts/OpacityContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { LayersProvider } from './contexts/LayersContext';
import { FlipProvider } from './contexts/FlipContext';
import { BrushProvider } from './contexts/BrushContext';

// Каждый провайдер ожидает children как ReactNode (обязателен)
type ProviderComponent = React.ComponentType<{ children: ReactNode }>;

const providers: ProviderComponent[] = [
  ColorProvider,
  SizeBrushProvider,
  OpacityContextProvider,
  ToolsProvider,
  LayersProvider,
  FlipProvider,
  BrushProvider,
];

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  // начальное значение — ReactElement (фрагмент), поэтому аккумулятор всегда ReactElement | null
  const tree = providers.reduceRight<ReactElement | null>(
    (acc, Provider) => {
      return <Provider>{acc}</Provider>;
    },
    <>{children}</>
  );
  return tree;
};
