import { FC, ReactNode } from 'react';
import { ColorProvider } from './contexts/ColorContext';
import { SizeBrushProvider } from './contexts/SizeContext';
import { OpacityContextProvider } from './contexts/OpacityContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { LayersProvider } from './contexts/LayersContext';

const providers = [ColorProvider, SizeBrushProvider, OpacityContextProvider, ToolsProvider, LayersProvider];

export const Providers: FC<{ children: ReactNode }> = ({ children }: { children: any }) => {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
};
