import { createContext, ReactNode, useContext, useState } from 'react';
import { Flip, FlipContextType } from '../types/share';

const FlipContext = createContext<FlipContextType | undefined>(undefined);

export const FlipProvider = ({ children }: { children: ReactNode }) => {
  const [flip, setFlip] = useState<Flip>({
    flipX: false,
    flipY: false,
  });

  return (
    <FlipContext.Provider
      value={{
        flip,
        setFlip,
      }}
    >
      {children}
    </FlipContext.Provider>
  );
};

export const useFlip = () => {
  const ctx = useContext(FlipContext);
  if (!ctx) throw new Error('FlipContext must be used within FlipProvider');
  return ctx;
};
