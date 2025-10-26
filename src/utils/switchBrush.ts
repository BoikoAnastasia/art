import { blurBrush } from '../brush/blurBrush';
import { calligraphyBrush } from '../brush/calligraphyBrush';
import { defaultBrush } from '../brush/defaultBrush';
import { dripBrush } from '../brush/dripBrush';
import { foamBrush } from '../brush/foamBrush';

export const SwitchBrush = (brush: string) => {
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
    default:
      return defaultBrush;
  }
};
