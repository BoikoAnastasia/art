import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { LayersContextType, LayerType, UpdateLayerType } from '../types/share';

let layerCounter = 1;

type HistorySnapshot = {
  layers: LayerType[];
  canvasSize: { width: number; height: number };
};

const LayersContext = createContext<LayersContextType | undefined>(undefined);

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const LayersProvider = ({
  children,
  initialCanvasSize = { width: 800, height: 600 },
}: {
  children: ReactNode;
  initialCanvasSize?: { width: number; height: number };
}) => {
  const initialLayers: LayerType[] = [{ id: 'layer-1', name: 'Слой 1', lines: [], filledShapes: [] }];

  const [history, setHistory] = useState<HistorySnapshot[]>([
    { layers: deepClone(initialLayers), canvasSize: deepClone(initialCanvasSize) },
  ]);

  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<LayerType[] | null>(null);
  const [activeLayerId, setActiveLayerId] = useState(initialLayers[0].id);
  const [selection, setSelection] = useState<null | {
    layerId: string;
    paths: any[];
    x: number;
    y: number;
  }>(null);

  const HISTORY_LIMIT = 100;

  const currentSnapshot = history[index];
  const layers = pending ?? currentSnapshot.layers;
  const [canvasSize, setCanvasSize] = useState(currentSnapshot.canvasSize);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const pushHistory = (newLayers: LayerType[], newCanvasSize = canvasSize) => {
    const snapshot: HistorySnapshot = {
      layers: deepClone(newLayers),
      canvasSize: deepClone(newCanvasSize),
    };

    const slice = history.slice(0, index + 1);
    const newHistory = slice.concat(snapshot);
    if (newHistory.length > HISTORY_LIMIT) {
      const trimmed = newHistory.slice(newHistory.length - HISTORY_LIMIT);
      setHistory(trimmed);
      setIndex(trimmed.length - 1);
    } else {
      setHistory(newHistory);
      setIndex(newHistory.length - 1);
    }

    setCanvasSize(snapshot.canvasSize);
    setPending(null);
  };

  const addLayer = (name?: string) => {
    layerCounter++;
    const newLayer: LayerType = {
      id: `layer-${layerCounter}`,
      name: name || `Слой ${layerCounter}`,
      lines: [],
      filledShapes: [],
    };

    const newLayers = deepClone(layers).concat([newLayer]);
    pushHistory(newLayers);
    setActiveLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    const newLayers = deepClone(layers).filter((l) => l.id !== id);
    pushHistory(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[0].id);
  };

  const clearActiveLayer = () => updateLayer([], [], { commit: true });

  const updateLayer: UpdateLayerType = (lines, filledShapes, opts = { commit: true }) => {
    if (!activeLayerId) return;
    const base = deepClone(layers);
    const idx = base.findIndex((l) => l.id === activeLayerId);
    if (idx === -1) return;

    const updated = {
      ...base[idx],
      lines: typeof lines !== 'undefined' ? lines : base[idx].lines,
      filledShapes: typeof filledShapes !== 'undefined' ? filledShapes : base[idx].filledShapes,
    } as LayerType;

    base[idx] = updated;

    if (opts.commit === false) {
      setPending(base);
    } else {
      pushHistory(base);
    }
  };

  const setLayers = (newLayers: LayerType[], newCanvasSize?: { width: number; height: number }) => {
    const sizeToPush = newCanvasSize ?? canvasSize;
    pushHistory(newLayers, sizeToPush);
  };

  const updateCanvasSize = (newSize: { width: number; height: number }) => {
    setCanvasSize(newSize);
    pushHistory(layers, newSize);
  };

  const commit = () => {
    if (!pending) return;
    pushHistory(pending);
  };

  const undo = () => {
    if (!canUndo) return;
    const newIndex = index - 1;
    setIndex(newIndex);
    const snapshot = history[newIndex];
    setCanvasSize(snapshot.canvasSize);
    setPending(null);
  };

  const redo = () => {
    if (!canRedo) return;
    const newIndex = index + 1;
    setIndex(newIndex);
    const snapshot = history[newIndex];
    setCanvasSize(snapshot.canvasSize);
    setPending(null);
  };

  const value = useMemo(
    () => ({
      layers,
      canvasSize,
      activeLayerId,
      setActiveLayerId,
      addLayer,
      removeLayer,
      clearActiveLayer,
      updateLayer,
      updateCanvasSize,
      commit,
      undo,
      redo,
      canUndo,
      canRedo,
      selection,
      setSelection,
      setLayers,
    }),
    [layers, canvasSize, activeLayerId, index, pending, canUndo, canRedo, selection]
  );

  return <LayersContext.Provider value={value as unknown as LayersContextType}>{children}</LayersContext.Provider>;
};

export const useLayers = () => {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error('useLayers must be used within LayersProvider');
  return ctx;
};
