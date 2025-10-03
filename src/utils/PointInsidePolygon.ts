// Утилита для проверки попадания в полигон
export const pointInsidePolygon = (point: { x: number; y: number }, polygon: number[]) => {
  const x = point.x;
  const y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length / 2 - 1; i < polygon.length / 2; j = i++) {
    const xi = polygon[i * 2],
      yi = polygon[i * 2 + 1];
    const xj = polygon[j * 2],
      yj = polygon[j * 2 + 1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};
