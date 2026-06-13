import { ibwKg } from './ibw.ts';
import { round } from './units.ts';
import type {
  DoseStatus,
  HcqAssessment,
  IbwAlgorithm,
  MethodResult,
  PatientInput,
} from '../types.ts';

export const AAO_MG_PER_KG = 5.0;
export const IBW_MG_PER_KG = 6.5;
export const HYBRID_MG_PER_KG = 5.0;
export const SEVERE_OBESITY_BMI = 35;
export const CAP_400_MG = 400;
export const TABLET_SIZE_MG = 200;

function buildMethod(
  id: string,
  label: string,
  thresholdLabel: string,
  doseMg: number,
  weightKg: number,
  thresholdMgPerKg: number,
): MethodResult {
  const mgPerKg = weightKg > 0 ? doseMg / weightKg : 0;
  const maxDailyDoseMg = weightKg * thresholdMgPerKg;
  let status: DoseStatus = 'within';
  if (mgPerKg > thresholdMgPerKg) {
    status = mgPerKg <= thresholdMgPerKg * 1.1 ? 'caution' : 'exceeds';
  }

  const statusWord =
    status === 'within' ? 'within' : status === 'caution' ? 'borderline' : 'exceeds';

  return {
    id,
    label,
    thresholdLabel,
    mgPerKg: round(mgPerKg, 2),
    thresholdMgPerKg,
    maxDailyDoseMg: round(maxDailyDoseMg, 0),
    status,
    summary: `${doseMg} mg/day = ${round(mgPerKg, 1)} mg/kg (${statusWord} ${thresholdLabel})`,
  };
}

function tabletNote(maxMg: number): string {
  const tablets = Math.floor(maxMg / TABLET_SIZE_MG);
  const roundedMax = tablets * TABLET_SIZE_MG;
  if (tablets <= 0) return 'Dose below one 200 mg tablet per day.';
  return `Nearest practical 200 mg tablet step: up to ${roundedMax} mg/day (${tablets} × 200 mg). Rheumatology often uses 200 or 400 mg/day.`;
}

function buildNarrative(methods: MethodResult[], doseMg: number): string {
  const parts = methods.map((m) => {
    const word = m.status === 'within' ? 'within' : m.status === 'caution' ? 'borderline for' : 'exceeds';
    return `${doseMg} mg/day is ${word} ${m.label} (${round(m.mgPerKg, 1)} mg/kg vs ${m.thresholdMgPerKg} mg/kg threshold)`;
  });
  return parts.join('; ') + '.';
}

export function assessHcqDose(
  input: PatientInput,
  ibwAlgorithm: IbwAlgorithm = 'nhlbi',
): HcqAssessment {
  const { sex, heightCm, weightKg: abwKg, dailyDoseMg } = input;
  const ibw = ibwKg(sex, heightCm, ibwAlgorithm);
  const dosingWeightKg = Math.min(abwKg, ibw);
  const patientBmi = heightCm > 0 ? abwKg / (heightCm / 100) ** 2 : 0;

  const aao = buildMethod(
    'aao',
    'AAO real body weight',
    'AAO ≤5.0 mg/kg ABW',
    dailyDoseMg,
    abwKg,
    AAO_MG_PER_KG,
  );

  const ibwMethod = buildMethod(
    'ibw',
    `IBW (${ibwAlgorithm === 'nhlbi' ? 'NIH/NHLBI' : 'Devine'})`,
    'IBW ≤6.5 mg/kg',
    dailyDoseMg,
    ibw,
    IBW_MG_PER_KG,
  );

  const hybrid = buildMethod(
    'hybrid',
    'Lesser-of-weight (Browning-style)',
    '≤5.0 mg/kg min(ABW, IBW)',
    dailyDoseMg,
    dosingWeightKg,
    HYBRID_MG_PER_KG,
  );

  const cap400Warning =
    patientBmi >= SEVERE_OBESITY_BMI && dailyDoseMg > CAP_400_MG;
  const cap400Message = cap400Warning
    ? `BMI ≥ ${SEVERE_OBESITY_BMI}: AAO recommends considering ≤400 mg/day for severely obese patients unless medically necessary with close monitoring.`
    : patientBmi >= SEVERE_OBESITY_BMI && dailyDoseMg <= CAP_400_MG
      ? `BMI ≥ ${SEVERE_OBESITY_BMI}: Current dose is at or below the 400 mg/day cap for severe obesity.`
      : null;

  const methods = [aao, ibwMethod, hybrid];

  if (cap400Warning) {
    methods.push({
      id: 'cap400',
      label: '400 mg/day obesity cap',
      thresholdLabel: '≤400 mg/day (severe obesity)',
      mgPerKg: round(dailyDoseMg / abwKg, 2),
      thresholdMgPerKg: CAP_400_MG / abwKg,
      maxDailyDoseMg: CAP_400_MG,
      status: 'exceeds',
      summary: `${dailyDoseMg} mg/day exceeds 400 mg/day cap recommended for severe obesity`,
    });
  }

  const hybridMax = dosingWeightKg * HYBRID_MG_PER_KG;

  return {
    abwKg: round(abwKg, 1),
    ibwKg: round(ibw, 1),
    ibwAlgorithm,
    dosingWeightKg: round(dosingWeightKg, 1),
    bmi: round(patientBmi, 1),
    dailyDoseMg,
    mgPerKgAbw: round(dailyDoseMg / abwKg, 2),
    mgPerKgIbw: round(dailyDoseMg / ibw, 2),
    mgPerKgHybrid: round(dailyDoseMg / dosingWeightKg, 2),
    methods,
    cap400Warning,
    cap400Message,
    tabletNote: tabletNote(Math.min(aao.maxDailyDoseMg, hybridMax)),
    narrative: buildNarrative(methods.filter((m) => m.id !== 'cap400'), dailyDoseMg),
  };
}

export function isValidInput(input: Partial<PatientInput>): input is PatientInput {
  return (
    input.sex !== undefined &&
    typeof input.heightCm === 'number' &&
    input.heightCm > 0 &&
    typeof input.weightKg === 'number' &&
    input.weightKg > 0 &&
    typeof input.dailyDoseMg === 'number' &&
    input.dailyDoseMg > 0
  );
}
