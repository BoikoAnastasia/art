/* eslint-disable prettier/prettier */
import { Point } from '../types/share';

export const offsetPoints = (points: Point[], dx: number, dy: number): Point[] => {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
};

export const flattenToNumbers = (points: Point[] | number[]) => {
  if (points.length === 0) return [];
  return (typeof points[0] === 'number') ? (points as number[]) : (points as Point[]).flatMap((p) => [p.x, p.y]);
};
