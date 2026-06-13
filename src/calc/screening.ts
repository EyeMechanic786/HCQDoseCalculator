import type { HcqAssessment, ScreeningGuidance, ScreeningRiskFactors } from '../types.ts';
import type { DoseStatus } from '../types.ts';

export function getScreeningGuidance(
  assessment: HcqAssessment | null,
  risks: ScreeningRiskFactors,
): ScreeningGuidance {
  const elevatedRisk =
    risks.renalDisease ||
    risks.tamoxifen ||
    risks.ageAtStartOver60 ||
    (risks.durationYears !== null && risks.durationYears >= 5) ||
    (assessment !== null &&
      assessment.methods.some((m) => m.status === 'exceeds' || m.status === 'caution'));

  const deferFirstFiveYears =
    !elevatedRisk && (risks.durationYears === null || risks.durationYears < 5);

  const recommendations: string[] = [
    'Baseline screening (fundus, OCT, wide-field FAF) soon after HCQ is started — for comparison with later exams.',
  ];

  if (deferFirstFiveYears) {
    recommendations.push(
      'Annual OCT and FAF may be deferred during the first 5 years if there are no significant risk factors.',
    );
  } else {
    recommendations.push(
      'Annual screening with OCT and wide-field FAF while on HCQ (risk factors or ≥5 years of use).',
    );
  }

  recommendations.push(
    'Visual fields and mfERG are adjunct confirmatory tests, not primary screening tools.',
    'Communicate dosing concerns and screening findings with the prescribing physician.',
  );

  const riskNotes: string[] = [];
  if (risks.renalDisease) riskNotes.push('Renal disease increases retinopathy risk.');
  if (risks.tamoxifen) riskNotes.push('Concurrent tamoxifen increases retinopathy risk.');
  if (risks.ageAtStartOver60) riskNotes.push('HCQ initiation at older age increases risk.');
  if (risks.durationYears !== null && risks.durationYears >= 5) {
    riskNotes.push(`Duration of use: ${risks.durationYears} years — annual screening advised.`);
  }
  if (assessment?.cap400Warning) {
    riskNotes.push('Current dose exceeds 400 mg/day cap for severe obesity.');
  }
  if (assessment?.methods.some((m) => m.status === 'exceeds')) {
    riskNotes.push('Daily dose exceeds one or more safe dosing thresholds — discuss with prescriber.');
  }

  return {
    baselineRequired: true,
    annualScreening: !deferFirstFiveYears,
    deferFirstFiveYears,
    elevatedRisk,
    recommendations,
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
