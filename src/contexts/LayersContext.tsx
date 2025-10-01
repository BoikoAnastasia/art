import React, { createContext, useContext, useState, useMemo } from 'react';
import { LayersContextType, LayerType } from '../types/share';

let layerCounter = 1;

const LayersContext = createContext<LayersContextType | undefined>(undefined);

// Вспомогательный глубокий клон
const deepClone = (v: any) => JSON.parse(JSON.stringify(v));

export const LayersProvider = ({ children }: { children: any }) => {
  const initialLayers: LayerType[] = [{ id: 'layer-1', name: 'Слой 1', lines: [], filledShapes: [] }];

  // История представлена массивом снимков состояний слоёв
  const [history, setHistory] = useState<LayerType[][]>(() => [deepClone(initialLayers)]);
  const [index, setIndex] = useState<number>(0);
  const [pending, setPending] = useState<LayerType[] | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string>(initialLayers[0].id);

  // Настройки
  const HISTORY_LIMIT = 100;

  // Текущие видимые слои — pending (во время рисования) или snapshot из истории
  const layers = pending ?? history[index];

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  // Общая функция, которая пушит новое состояние в историю
  const pushHistory = (newLayers: LayerType[]) => {
    const slice = history.slice(0, index + 1);
    const newHistory = slice.concat([deepClone(newLayers)]);
    // Обрезаем историю по лимиту
    if (newHistory.length > HISTORY_LIMIT) {
      const excess = newHistory.length - HISTORY_LIMIT;
      setHistory(newHistory.slice(excess));
      setIndex(HISTORY_LIMIT - 1);
    } else {
      setHistory(newHistory);
      setIndex(newHistory.length - 1);
    }
    // после пуша pending сбрасываем
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
    if (layers.length === 1) return; // нельзя удалить последний слой
    const newLayers = deepClone(layers).filter((l: LayerType) => l.id !== id);
    pushHistory(newLayers);
    if (activeLayerId === id) setActiveLayerId(newLayers[0].id);
  };

  const clearActiveLayer = () => {
    updateLayer([], [], { commit: true });
  };

  /**
   * Обновляет активный слой.
   * Если opts.commit === false — применяет обновление временно (pending),
   * иначе — добавляет snapshot в историю.
   */
  const updateLayer = (lines?: any[], filledShapes?: any[], opts: { commit?: boolean } = { commit: true }) => {
    if (!activeLayerId) return;
    const base = deepClone(layers);
    const idx = base.findIndex((l: LayerType) => l.id === activeLayerId);
    if (idx === -1) return;

    const updated = {
      ...base[idx],
      lines: typeof lines !== 'undefined' ? lines : base[idx].lines,
      filledShapes: typeof filledShapes !== 'undefined' ? filledShapes : base[idx].filledShapes,
    } as LayerType;

    base[idx] = updated;

    if (opts.commit === false) {
      // Временно показываем изменения, не трогая историю
      setPending(base);
    } else {
      // Коммитим в историю
      pushHistory(base);
    }
  };

  const commit = () => {
    if (!pending) return;
    pushHistory(pending);
  };

  const undo = () => {
    if (!canUndo) return;
    setIndex((i) => i - 1);
    setPending(null);
  };

  const redo = () => {
    if (!canRedo) return;
    setIndex((i) => i + 1);
    setPending(null);
  };

  const value = useMemo(
    () => ({
      layers,
      activeLayerId,
      setActiveLayerId,
      addLayer,
      removeLayer,
      clearActiveLayer,
      updateLayer,
      commit,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [layers, activeLayerId, history, index, pending, canUndo, canRedo]
  );

  // Приведение к типу, чтобы не ломать существующий контракт типов —
  // при желании можно обновить LayersContextType в ../types/share
  return <LayersContext.Provider value={value as unknown as LayersContextType}>{children}</LayersContext.Provider>;
};

export const useLayers = () => {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error('useLayers must be used within LayersProvider');
  return ctx;
};
