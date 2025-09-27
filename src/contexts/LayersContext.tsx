import { createContext, useContext, useState } from 'react';

export type LayerType = {
  id: string;
  name: string;
  lines: any[];
  filledShapes: any[];
};

type LayersContextType = {
  layers: LayerType[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  clearActiveLayer: () => void;
  updateLayer: (lines: any[], filledShapes: any[]) => void;
};
let layerCounter = 1;

const LayersContext = createContext<LayersContextType | undefined>(undefined);

export const LayersProvider = ({ children }: { children: any }) => {
  const [layers, setLayers] = useState<LayerType[]>([{ id: 'layer-1', name: 'Слой 1', lines: [], filledShapes: [] }]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');

  const addLayer = (name?: string) => {
    layerCounter++;
    const newLayer: LayerType = {
      id: `layer-${layerCounter}`,
      name: name || `Слой ${layerCounter}`,
      lines: [],
      filledShapes: [],
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return; // нельзя удалить последний слой
    const newLayers = layers.filter((l) => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[0].id);
  };

  const clearActiveLayer = () => {
    setLayers(layers.map((l) => (l.id === activeLayerId ? { ...l, lines: [], filledShapes: [] } : l)));
  };

  const updateLayer = (lines: any[], filledShapes: any[]) => {
    setLayers(layers.map((l) => (l.id === activeLayerId ? { ...l, lines, filledShapes } : l)));
  };

  return (
    <LayersContext.Provider
      value={{
        layers,
        activeLayerId,
        setActiveLayerId,
        addLayer,
        removeLayer,
        clearActiveLayer,
        updateLayer,
      }}
    >
      {children}
    </LayersContext.Provider>
  );
};

export const useLayers = () => {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error('useLayers must be used within LayersProvider');
  return ctx;
};
