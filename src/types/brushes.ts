export const Brushes = {
  pen: {
    strokeCap: 'round',
    strokeJoin: 'round',
    tension: 0.5,
    composite: 'source-over',
  },
  pencil: {
    strokeCap: 'round',
    strokeJoin: 'round',
    tension: 0.2,
    opacity: 0.7,
    dash: [2, 2], // прерывистость как карандаш
  },
  marker: {
    strokeCap: 'round',
    strokeJoin: 'round',
    tension: 0.8,
    composite: 'multiply',
    opacity: 0.5,
  },
  highlighter: {
    strokeCap: 'round',
    strokeJoin: 'round',
    composite: 'multiply',
    opacity: 0.3,
    shadowColor: 'yellow',
    shadowBlur: 20,
  },
  neon: {
    strokeCap: 'round',
    strokeJoin: 'round',
    shadowColor: 'cyan',
    shadowBlur: 15,
    composite: 'lighter',
  },
  eraser: {
    composite: 'destination-out',
  },

  // 🎨 Художественные
  watercolor: {
    opacity: 0.4,
    composite: 'multiply',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowBlur: 10,
  },
  oilbrush: {
    opacity: 0.9,
    tension: 1,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 5,
  },
  charcoal: {
    opacity: 0.6,
    dash: [1, 3],
    shadowColor: 'black',
    shadowBlur: 2,
  },
  chalk: {
    opacity: 0.5,
    dash: [5, 3],
    shadowColor: 'white',
    shadowBlur: 5,
  },
  spray: {
    type: 'spray', // особая кисть, рисуется точками
    density: 30,
    radius: 15,
  },

  // 🖼 Текстурные
  textureCanvas: {
    type: 'texture',
    src: '/textures/canvas.png',
  },
  texturePaper: {
    type: 'texture',
    src: '/textures/paper.png',
  },
  textureFabric: {
    type: 'texture',
    src: '/textures/fabric.png',
  },
  textureInk: {
    type: 'texture',
    src: '/textures/ink.png',
  },
};
