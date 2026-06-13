import { describe, expect, it } from 'vitest';
import { assessHcqDose } from '../src/calc/hcqDose.ts';
import { computeSafeDoseRange } from '../src/export/safeDoseRange.ts';

describe('computeSafeDoseRange', () => {
  it('returns min–max across AAO, IBW, and hybrid ceilings', () => {
    const assessment = assessHcqDose(
      { sex: 'female', heightCm: 163, weightKg: 73, dailyDoseMg: 400 },
      'nhlbi',
    );
    const range = computeSafeDoseRange(assessment);
    expect(range.minMg).toBe(318);
    expect(range.maxMg).toBe(414);
    expect(range.label).toBe('318–414 mg/day');
  });

  it('caps all ceilings at 400 mg/day when BMI ≥ 35', () => {
    const assessment = assessHcqDose(
      { sex: 'female', heightCm: 160, weightKg: 100, dailyDoseMg: 400 },
      'nhlbi',
    );
    expect(assessment.bmi).toBeGreaterThanOrEqual(35);
    const range = computeSafeDoseRange(assessment);
    expect(range.minMg).toBeLessThanOrEqual(400);
    expect(range.maxMg).toBeLessThanOrEqual(400);
  });
});
