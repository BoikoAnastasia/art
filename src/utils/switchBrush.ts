import { airbrush } from '../brush/airbrush';
import { blurBrush } from '../brush/blurBrush';
import { calligraphyBrush } from '../brush/calligraphyBrush';
import { defaultBrush } from '../brush/defaultBrush';
import { dripBrush } from '../brush/dripBrush';
import { foamBrush } from '../brush/foamBrush';

export interface BrushProps {
  start: any;
  end: any;
  color: string;
  size: number;
  state?: any;
}

export const SwitchBrush = (brush: string): ((ctx: CanvasRenderingContext2D, props: BrushProps) => any) => {
  switch (brush) {
    case 'pen':
      return defaultBrush;
    case 'calligraphy':
      return calligraphyBrush;
    case 'drip':
      return dripBrush;
    case 'foam':
      return foamBrush;
    case 'blur':
      return blurBrush;
    case 'air':
      return airbrush;
    default:
      return defaultBrush;
  }
};
