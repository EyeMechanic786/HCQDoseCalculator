import {
  AAO_MG_PER_KG,
  CAP_400_MG,
  IBW_MG_PER_KG,
  SEVERE_OBESITY_BMI,
} from './hcqDose.ts';
import { round } from './units.ts';
import type { WeeklyRegimen } from '../types.ts';

const DAYS_PER_WEEK = 7;

function buildScheduleSummary(daysAt400: number, daysAt200: number, offDays: number): string {
  const parts: string[] = [];
  if (daysAt400 > 0) parts.push(`${daysAt400} day${daysAt400 === 1 ? '' : 's'} at 400 mg`);
  if (daysAt200 > 0) parts.push(`${daysAt200} day${daysAt200 === 1 ? '' : 's'} at 200 mg`);
  if (offDays > 0) parts.push(`${offDays} day${offDays === 1 ? '' : 's'} off`);
  return parts.join(' · ') || 'No dosing recommended';
}

function bestWeeklyMix(maxWeeklyMg: number): Pick<
  WeeklyRegimen,
  'daysAt400' | 'daysAt200' | 'offDays' | 'scheduleSummary'
> {
  let bestTotal = 0;
  let best400 = 0;
  let best200 = 0;

  for (let daysAt400 = 0; daysAt400 <= DAYS_PER_WEEK; daysAt400++) {
    for (let daysAt200 = 0; daysAt200 <= DAYS_PER_WEEK - daysAt400; daysAt200++) {
      const total = daysAt400 * 400 + daysAt200 * 200;
      if (total <= maxWeeklyMg && total >= bestTotal) {
        bestTotal = total;
        best400 = daysAt400;
        best200 = daysAt200;
      }
    }
  }

  const offDays = DAYS_PER_WEEK - best400 - best200;
  return {
    daysAt400: best400,
    daysAt200: best200,
    offDays,
    scheduleSummary: buildScheduleSummary(best400, best200, offDays),
  };
}

/** DoseChecker-style weekly regimen: use whichever of ABW or IBW yields the lower weekly cap. */
export function computeWeeklyRegimen(
  abwKg: number,
  ibwKg: number,
  dailyDoseMg: number,
  bmi: number,
): WeeklyRegimen {
  const maxWeeklyAbwMg = round(AAO_MG_PER_KG * abwKg * DAYS_PER_WEEK, 0);
  const maxWeeklyIbwMg = round(IBW_MG_PER_KG * ibwKg * DAYS_PER_WEEK, 0);
  const obesityWeeklyCap = CAP_400_MG * DAYS_PER_WEEK;

  let governingWeeklyMg = Math.min(maxWeeklyAbwMg, maxWeeklyIbwMg);
  let governingMethod: WeeklyRegimen['governingMethod'] =
    maxWeeklyAbwMg <= maxWeeklyIbwMg ? 'abw' : 'ibw';

  if (bmi >= SEVERE_OBESITY_BMI) {
    governingWeeklyMg = Math.min(governingWeeklyMg, obesityWeeklyCap);
    if (obesityWeeklyCap <= Math.min(maxWeeklyAbwMg, maxWeeklyIbwMg)) {
      governingMethod = 'abw';
    }
  }

  const mix = bestWeeklyMix(governingWeeklyMg);
  const currentWeeklyMg = dailyDoseMg * DAYS_PER_WEEK;

  return {
    maxWeeklyAbwMg,
    maxWeeklyIbwMg,
    governingWeeklyMg,
    governingMethod,
    governingMethodLabel:
      governingMethod === 'abw'
        ? 'Actual body weight (5.0 mg/kg/day)'
        : 'Ideal body weight (6.5 mg/kg/day)',
    maxDailyEquivalentMg: round(governingWeeklyMg / DAYS_PER_WEEK, 0),
    ...mix,
    currentWeeklyMg,
    currentExceedsSafe: currentWeeklyMg > governingWeeklyMg,
  };
}
