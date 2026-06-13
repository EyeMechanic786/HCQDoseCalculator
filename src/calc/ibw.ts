import type { IbwAlgorithm, Sex } from '../types.ts';
import { cmToIn, lbToKg } from './units.ts';

/** NHLBI table linear fit from Michaelides et al. (Ophthalmology & Eye Science 2014). */
export function ibwNhlbiLb(heightIn: number): number {
  return 4.28 * heightIn - 134.32;
}

/** Devine formula (1974), widely used in clinical dosing. */
export function ibwDevineKg(sex: Sex, heightCm: number): number {
  const base = sex === 'male' ? 50 : 45.5;
  return base + 0.91 * (heightCm - 152.4);
}

export function ibwKg(sex: Sex, heightCm: number, algorithm: IbwAlgorithm): number {
  if (algorithm === 'devine') {
    return Math.max(ibwDevineKg(sex, heightCm), 0);
  }
  const heightIn = cmToIn(heightCm);
  const ibwLb = ibwNhlbiLb(heightIn);
  return Math.max(lbToKg(ibwLb), 0);
}

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return weightKg / (heightM * heightM);
}
