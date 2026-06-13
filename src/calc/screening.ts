import type {
  HcqAssessment,
  IdentifiedRiskFactor,
  ScreeningGuidance,
  ScreeningRiskFactors,
  YesNo,
} from '../types.ts';
import type { DoseStatus } from '../types.ts';

const RCOHPTH_SCREENING_NOTE =
  'Start HCQ screening only after five or more years of continuous usage, unless high-risk factors are noted by the referring healthcare professional.';

const RISK_FACTOR_LABELS: Record<keyof ScreeningRiskFactors, string> = {
  renalDisease: 'Concurrent renal disease',
  tamoxifen: 'Concurrent tamoxifen',
  macularPathology: 'Macular pathology',
  ageAtStartOver60: 'HCQ started after age 60',
  hcqFiveYearsOrMore: 'On HCQ ≥5 years',
  hcqTwentyYearsOrMore: 'On HCQ ≥20 years',
};

function isYes(value: YesNo): boolean {
  return value === 'yes';
}

export function riskFactorsComplete(risks: ScreeningRiskFactors): boolean {
  return (Object.keys(RISK_FACTOR_LABELS) as (keyof ScreeningRiskFactors)[]).every(
    (key) => risks[key] === 'yes' || risks[key] === 'no',
  );
}

export function getIdentifiedRiskFactors(risks: ScreeningRiskFactors): IdentifiedRiskFactor[] {
  return (Object.keys(RISK_FACTOR_LABELS) as (keyof ScreeningRiskFactors)[])
    .filter((key) => isYes(risks[key]))
    .map((key) => ({ id: key, label: RISK_FACTOR_LABELS[key] }));
}

export function getScreeningGuidance(
  assessment: HcqAssessment | null,
  risks: ScreeningRiskFactors,
): ScreeningGuidance {
  const complete = riskFactorsComplete(risks);
  const identifiedRiskFactors = getIdentifiedRiskFactors(risks);
  const doseElevated =
    assessment !== null &&
    assessment.methods.some((m) => m.status === 'exceeds' || m.status === 'caution');

  const elevatedRisk =
    complete &&
    (identifiedRiskFactors.length > 0 || doseElevated);

  const deferFirstFiveYears =
    complete &&
    !elevatedRisk &&
    !isYes(risks.hcqFiveYearsOrMore);

  const recommendations: string[] = [
    'Baseline screening (fundus, OCT, wide-field FAF) soon after HCQ is started — for comparison with later exams.',
  ];

  if (!complete) {
    recommendations.push(
      'Complete all screening risk factor responses (Yes/No) before finalising the screening plan.',
    );
  } else if (deferFirstFiveYears) {
    recommendations.push(
      'Annual OCT and FAF may be deferred during the first 5 years if there are no significant risk factors.',
    );
  } else {
    recommendations.push(
      'Annual screening with OCT and wide-field FAF while on HCQ (risk factors present and/or dose concern).',
    );
  }

  recommendations.push(
    'Visual fields and mfERG are adjunct confirmatory tests, not primary screening tools.',
    'Communicate dosing concerns and screening findings with the prescribing physician.',
  );

  const riskNotes: string[] = [];
  if (!complete) {
    riskNotes.push('Screening risk factors incomplete — select Yes or No for each item.');
  }
  if (isYes(risks.renalDisease)) riskNotes.push('Renal disease increases retinopathy risk.');
  if (isYes(risks.tamoxifen)) riskNotes.push('Concurrent tamoxifen increases retinopathy risk.');
  if (isYes(risks.macularPathology)) {
    riskNotes.push('Pre-existing macular pathology — baseline comparison and close monitoring advised.');
  }
  if (isYes(risks.ageAtStartOver60)) riskNotes.push('HCQ initiation at older age increases risk.');
  if (isYes(risks.hcqFiveYearsOrMore)) {
    riskNotes.push('On HCQ ≥5 years — annual screening advised.');
  }
  if (isYes(risks.hcqTwentyYearsOrMore)) {
    riskNotes.push('On HCQ ≥20 years — prolonged exposure increases retinopathy risk.');
  }
  if (assessment?.cap400Warning) {
    riskNotes.push('Current dose exceeds 400 mg/day cap for severe obesity.');
  }
  if (assessment?.methods.some((m) => m.status === 'exceeds')) {
    riskNotes.push('Daily dose exceeds one or more safe dosing thresholds — discuss with prescriber.');
  }

  const showRiskFactorWarning = complete && identifiedRiskFactors.length > 0;
  const riskFactorWarningMessage = showRiskFactorWarning
    ? `Higher-risk patient for HCQ retinal toxicity: ${identifiedRiskFactors.map((r) => r.label).join('; ')}. Consider closer screening and review dosing with the prescriber.`
    : null;

  return {
    baselineRequired: true,
    annualScreening: complete && !deferFirstFiveYears,
    deferFirstFiveYears,
    elevatedRisk,
    riskFactorsComplete: complete,
    identifiedRiskFactors,
    showRiskFactorWarning,
    riskFactorWarningMessage,
    recommendations,
    rcophthNote: RCOHPTH_SCREENING_NOTE,
    riskNotes,
  };
}

export function statusClass(status: DoseStatus): string {
  switch (status) {
    case 'within':
      return 'status--within';
    case 'caution':
      return 'status--caution';
    case 'exceeds':
      return 'status--exceeds';
  }
}

export function statusLabel(status: DoseStatus): string {
  switch (status) {
    case 'within':
      return 'Within guideline';
    case 'caution':
      return 'Borderline';
    case 'exceeds':
      return 'Exceeds guideline';
  }
}
