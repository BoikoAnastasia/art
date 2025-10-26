// utils/intersection.ts

type Pt = { x: number; y: number };

export const normalizePath = (path: any): Pt[] => {
  if (!path) return [];

  // flat number array
  if (typeof path[0] === 'number') {
    const out: Pt[] = [];
    for (let i = 0; i < path.length - 1; i += 2) out.push({ x: path[i], y: path[i + 1] });
    return out;
  }

  // array of {x:number, y:number}
  if (typeof path[0] === 'object' && typeof path[0].x === 'number') {
    return (path as Pt[]).map((p: any) => ({ x: p.x, y: p.y }));
  }

  // array of { x: {x,y}, y: {x,y} }  -> интерпретируем как последовательность сегментов: push start and end
  if (typeof path[0] === 'object' && typeof path[0].x === 'object' && 'x' in path[0].x) {
    const out: Pt[] = [];
    for (const seg of path) {
      if (seg.x && typeof seg.x.x === 'number') out.push({ x: seg.x.x, y: seg.x.y });
      if (seg.y && typeof seg.y.x === 'number') out.push({ x: seg.y.x, y: seg.y.y });
    }
    // возможно рядом идут одинаковые точки — можно их отфильтровать, чтобы не было дублей
    const filtered: Pt[] = [];
    for (let i = 0; i < out.length; i++) {
      const p = out[i];
      const prev = filtered[filtered.length - 1];
      if (!prev || prev.x !== p.x || prev.y !== p.y) filtered.push(p);
    }
    return filtered;
  }

  // fallback: попытка привести элементы к {x,y}
  try {
    return (path as any[]).map((p) => ({ x: (p.x && p.x.x) ?? p.x ?? 0, y: (p.y && p.y.y) ?? p.y ?? 0 }));
  } catch {
    return [];
  }
};

// Нормализует polygon: принимает flat number array или array {x,y}
export const normalizePolygon = (poly: any): Pt[] => {
  if (!poly) return [];
  if (typeof poly[0] === 'number') {
    const out: Pt[] = [];
    for (let i = 0; i < poly.length - 1; i += 2) out.push({ x: poly[i], y: poly[i + 1] });
    return out;
  }
  // array of {x,y}
  return (poly as any[]).map((p) => ({ x: p.x, y: p.y }));
};

// point-in-polygon (ray casting) для массива объектов [{x,y}, ...]
export const pointInsidePolyObj = (point: Pt, poly: Pt[]) => {
  const x = point.x;
  const y = point.y;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Проверка пересечения двух отрезков p1-q1 и p2-q2 (для объектов)
const onSegment = (p: Pt, q: Pt, r: Pt) =>
  q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);

const orientation = (p: Pt, q: Pt, r: Pt) => {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0;
  return val > 0 ? 1 : 2;
};

const segmentsIntersect = (p1: Pt, q1: Pt, p2: Pt, q2: Pt) => {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
};

// Основная функция. Принимает path и polygon в любых распространённых форматах
export const isPathIntersectingPolygon = (rawPath: any, rawPoly: any) => {
  const path = normalizePath(rawPath);
  let poly = normalizePolygon(rawPoly);
  if (path.length === 0 || poly.length === 0) {
    console.log('Empty path or poly');
    return false;
  }

  // если poly замкнут дублированием первой точки — убираем последний дубликат
  if (poly.length > 1) {
    const first = poly[0];
    const last = poly[poly.length - 1];
    if (first.x === last.x && first.y === last.y) {
      poly = poly.slice(0, -1);
    }
  }

  // 1) любая вершина path внутри poly?
  for (const p of path) {
    const inside = pointInsidePolyObj(p, poly);
    if (inside) {
      return true;
    }
  }

  // 2) любая вершина poly внутри path?
  for (const p of poly) {
    const inside = pointInsidePolyObj(p, path);
    if (inside) {
      return true;
    }
  }

  // 3) есть ли пересечение любого сегмента path с любым ребром poly?
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    for (let j = 0; j < poly.length; j++) {
      const c = poly[j];
      const d = poly[(j + 1) % poly.length];
      const intersect = segmentsIntersect(a, b, c, d);
      console.log(
        `Segment ${JSON.stringify(a)}-${JSON.stringify(b)} vs poly edge ${JSON.stringify(c)}-${JSON.stringify(d)}: ${intersect}`
      );
      if (intersect) {
        return true;
      }
    }
  }
  return false;
};
