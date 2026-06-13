import { CAP_400_MG, SEVERE_OBESITY_BMI } from '../calc/hcqDose.ts';
import { round } from '../calc/units.ts';
import type { HcqAssessment } from '../types.ts';

const CORE_METHOD_IDS = ['aao', 'ibw', 'hybrid'] as const;

export interface SafeDoseRange {
  /** Most restrictive (governing) max daily dose across methods. */
  minMg: number;
  /** Least restrictive max daily dose across methods. */
  maxMg: number;
  /** Display label for Study_Data export, e.g. "318–414 mg/day". */
  label: string;
}

/** Safe daily HCQ dose ceiling range from AAO, IBW, and hybrid methods (mg/day). */
export function computeSafeDoseRange(assessment: HcqAssessment): SafeDoseRange {
  const ceilings = assessment.methods
    .filter((method) => CORE_METHOD_IDS.includes(method.id as (typeof CORE_METHOD_IDS)[number]))
    .map((method) => method.maxDailyDoseMg);

  if (ceilings.length === 0) {
    return { minMg: 0, maxMg: 0, label: '' };
  }

  let capped = ceilings;
  if (assessment.bmi >= SEVERE_OBESITY_BMI) {
    capped = ceilings.map((mg) => Math.min(mg, CAP_400_MG));
  }

  const minMg = round(Math.min(...capped), 0);
  const maxMg = round(Math.max(...capped), 0);
  const label =
    minMg === maxMg ? `${minMg} mg/day` : `${minMg}–${maxMg} mg/day`;

  return { minMg, maxMg, label };
}
