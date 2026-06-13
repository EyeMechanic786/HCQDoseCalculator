const LB_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}

export function ftInToCm(feet: number, inches: number): number {
  return inToCm(feet * 12 + inches);
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalIn = cmToIn(cm);
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - feet * 12);
  return { feet, inches: inches === 12 ? 0 : inches };
}

export function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, decimals = 1): string {
  return round(value, decimals).toFixed(decimals);
}
