import { describe, expect, it } from 'vitest';
import { ibwDevineKg, ibwKg, ibwNhlbiLb } from '../src/calc/ibw.ts';
import { assessHcqDose, AAO_MG_PER_KG, IBW_MG_PER_KG } from '../src/calc/hcqDose.ts';
import { getScreeningGuidance } from '../src/calc/screening.ts';
import {
  cmToFtIn,
  ftInToCm,
  inToCm,
  kgToLb,
  lbToKg,
  round,
} from '../src/calc/units.ts';

describe('units', () => {
  it('converts kg and lb round-trip', () => {
    expect(round(lbToKg(kgToLb(72.7)), 1)).toBe(72.7);
  });

  it('converts cm and ft/in round-trip', () => {
    const cm = ftInToCm(5, 4);
    expect(round(cm, 1)).toBe(162.6);
    const { feet, inches } = cmToFtIn(162.6);
    expect(feet).toBe(5);
    expect(inches).toBe(4);
  });
});

describe('ibw', () => {
  it('computes NIH/NHLBI IBW for reference female', () => {
    const heightIn = 64;
    const ibwLb = ibwNhlbiLb(heightIn);
    expect(round(ibwLb, 1)).toBe(139.6);
    const ibw = ibwKg('female', inToCm(heightIn), 'nhlbi');
    expect(round(ibw, 1)).toBe(63.3);
  });

  it('computes Devine IBW for female 163 cm', () => {
    const ibw = ibwDevineKg('female', 163);
    expect(round(ibw, 1)).toBe(55.1);
  });
});

describe('assessHcqDose — Michaelides reference case', () => {
  const input = {
    sex: 'female' as const,
    heightCm: 162.6,
    weightKg: 72.7,
    dailyDoseMg: 400,
  };

  it('flags AAO exceedance at 400 mg/day', () => {
    const result = assessHcqDose(input, 'nhlbi');
    const aao = result.methods.find((m) => m.id === 'aao')!;
    expect(aao.status).toBe('exceeds');
    expect(result.mgPerKgAbw).toBeGreaterThan(AAO_MG_PER_KG);
  });

  it('shows IBW within 6.5 mg/kg threshold', () => {
    const result = assessHcqDose(input, 'nhlbi');
    const ibw = result.methods.find((m) => m.id === 'ibw')!;
    expect(ibw.status).toBe('within');
    expect(result.mgPerKgIbw).toBeLessThan(IBW_MG_PER_KG);
  });

  it('flags hybrid lesser-of-weight exceedance', () => {
    const result = assessHcqDose(input, 'nhlbi');
    const hybrid = result.methods.find((m) => m.id === 'hybrid')!;
    expect(hybrid.status).toBe('exceeds');
    expect(result.dosingWeightKg).toBe(result.ibwKg);
    expect(hybrid.maxDailyDoseMg).toBeLessThan(400);
  });
});

describe('somatotype edge cases', () => {
  it('uses ABW when patient is asthenic (ABW < IBW)', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 170, weightKg: 50, dailyDoseMg: 200 },
      'nhlbi',
    );
    expect(result.dosingWeightKg).toBe(50);
    expect(result.abwKg).toBeLessThan(result.ibwKg);
  });

  it('uses IBW when patient is obese (ABW > IBW)', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 160, weightKg: 95, dailyDoseMg: 400 },
      'nhlbi',
    );
    expect(result.dosingWeightKg).toBe(result.ibwKg);
    expect(result.abwKg).toBeGreaterThan(result.ibwKg);
  });

  it('warns on 400 mg cap for severe obesity', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 160, weightKg: 110, dailyDoseMg: 400 },
      'nhlbi',
    );
    expect(result.bmi).toBeGreaterThanOrEqual(35);
    expect(result.cap400Warning).toBe(false);
  });

  it('flags dose above 400 mg cap when BMI >= 35', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 160, weightKg: 110, dailyDoseMg: 600 },
      'nhlbi',
    );
    expect(result.cap400Warning).toBe(true);
    expect(result.methods.some((m) => m.id === 'cap400')).toBe(true);
  });
});

describe('weekly regimen', () => {
  it('uses lower of ABW and IBW weekly caps when obese', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 160, weightKg: 95, dailyDoseMg: 400 },
      'nhlbi',
    );
    const w = result.weeklyRegimen;
    expect(w.maxWeeklyAbwMg).toBeGreaterThan(w.maxWeeklyIbwMg);
    expect(w.governingMethod).toBe('ibw');
    expect(w.governingWeeklyMg).toBe(w.maxWeeklyIbwMg);
    expect(w.currentExceedsSafe).toBe(true);
  });

  it('flags current weekly dose when above governing cap', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 162.6, weightKg: 72.7, dailyDoseMg: 400 },
      'nhlbi',
    );
    expect(result.weeklyRegimen.currentWeeklyMg).toBe(2800);
    expect(result.weeklyRegimen.currentExceedsSafe).toBe(true);
  });

  it('suggests a 200/400 mg weekly mix under the cap', () => {
    const result = assessHcqDose(
      { sex: 'female', heightCm: 162.6, weightKg: 72.7, dailyDoseMg: 200 },
      'nhlbi',
    );
    expect(result.weeklyRegimen.daysAt400 + result.weeklyRegimen.daysAt200).toBeLessThanOrEqual(7);
    expect(result.weeklyRegimen.scheduleSummary.length).toBeGreaterThan(0);
  });
});

describe('dose within AAO guideline', () => {
  it('passes for 300 mg/day on 80 kg patient', () => {
    const result = assessHcqDose(
      { sex: 'male', heightCm: 180, weightKg: 80, dailyDoseMg: 300 },
      'nhlbi',
    );
    const aao = result.methods.find((m) => m.id === 'aao')!;
    expect(aao.status).toBe('within');
    expect(result.mgPerKgAbw).toBe(3.75);
  });
});

describe('screening risk factors', () => {
  it('flags elevated risk when macular pathology is yes', () => {
    const assessment = assessHcqDose(
      { sex: 'female', heightCm: 180, weightKg: 80, dailyDoseMg: 300 },
      'nhlbi',
    );
    const guidance = getScreeningGuidance(assessment, {
      renalDisease: 'no',
      tamoxifen: 'no',
      macularPathology: 'yes',
      ageAtStartOver60: 'no',
      hcqTwentyYearsOrMore: 'no',
    });
    expect(guidance.elevatedRisk).toBe(true);
    expect(guidance.showRiskFactorWarning).toBe(true);
    expect(guidance.identifiedRiskFactors.some((r) => r.id === 'macularPathology')).toBe(true);
  });

  it('requires all yes/no answers before risk assessment is complete', () => {
    const guidance = getScreeningGuidance(null, {
      renalDisease: 'no',
      tamoxifen: '',
      macularPathology: 'no',
      ageAtStartOver60: 'no',
      hcqTwentyYearsOrMore: 'no',
    });
    expect(guidance.riskFactorsComplete).toBe(false);
    expect(guidance.showRiskFactorWarning).toBe(false);
  });
});
