// Упрощенная проверка точки в полигоне
export const PointInPolygon = (point: { x: number; y: number }, polygon: number[]): boolean => {
  // Реализация алгоритма ray casting
  let inside = false;
  for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
    const xi = polygon[i], yi = polygon[i + 1];
    const xj = polygon[j], yj = polygon[j + 1];
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  console.log(inside)
  return inside;
}