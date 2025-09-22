import { FC, ReactNode } from 'react';
import { ColorProvider } from './contexts/ColorContext';
import { SizeBrushProvider } from './contexts/SizeContext';

const providers = [ColorProvider, SizeBrushProvider];

export const Providers: FC<{ children: ReactNode }> = ({ children }: { children: any }) => {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
};
