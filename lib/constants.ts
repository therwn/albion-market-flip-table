import { CityName, ItemQuality } from '@/types';

export const TIERS = [
  '4.0', '4.1', '4.2', '4.3', '4.4',
  '5.0', '5.1', '5.2', '5.3', '5.4',
  '6.0', '6.1', '6.2', '6.3', '6.4',
  '7.0', '7.1', '7.2', '7.3', '7.4',
  '8.0', '8.1', '8.2', '8.3', '8.4',
];

export const QUALITIES: ItemQuality[] = [
  'Normal',
  'Good',
  'Outstanding',
  'Excellent',
  'Masterpiece',
];

export const CITIES: CityName[] = [
  'Fort Sterling',
  'Thetford',
  'Martlock',
  'Bridgewatch',
  'Lymhurst',
  'Caerleon',
];

export const PREMIUM_TAX = 0.04; // 4%
export const NON_PREMIUM_TAX = 0.08; // 8%
export const MARKET_TAX = 0.025; // 2.5%
export const SETUP_FEE = 0.025; // 2.5%
