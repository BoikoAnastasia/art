import { createContext, useContext, useState } from 'react';

type FlipContextType = {
  flipX: boolean;
  flipY: boolean;
  setFlipX: (b: boolean) => void;
  setFlipY: (b: boolean) => void;
};

const FlipContext = createContext<FlipContextType | undefined>(undefined);

export const FlipProvider = ({ children }: { children: any }) => {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  return (
    <FlipContext.Provider
      value={{
        flipX,
        setFlipX,
        flipY,
        setFlipY,
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
