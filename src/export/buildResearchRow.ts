import { assessHcqDose } from '../calc/hcqDose.ts';
import { getScreeningGuidance } from '../calc/screening.ts';
import { round } from '../calc/units.ts';
import type { FormState } from '../ui/calculatorForm.ts';
import type {
  AppDesign,
  DoseStatus,
  HcqAssessment,
  MethodResult,
  PatientInput,
  ScreeningGuidance,
} from '../types.ts';
import { APP_VERSION, FORMULA_VERSION } from './constants.ts';
import type { ResearchRow } from './columnSchema.ts';

export interface BuildResearchRowMeta {
  recordId: string;
  timestamp: string;
  layoutUsed: AppDesign;
  studyId: string;
  siteId: string;
  subjectId: string;
  encounterDate: string;
}

export interface BuildResearchRowInput {
  formState: FormState;
  patientInput: PatientInput;
  layoutUsed: AppDesign;
  meta: BuildResearchRowMeta;
}

function getMethod(assessment: HcqAssessment, id: string): MethodResult {
  const method = assessment.methods.find((m) => m.id === id);
  if (!method) throw new Error(`Method ${id} not found`);
  return method;
}

function methodRowFields(prefix: string, method: MethodResult): Record<string, string | number> {
  return {
    [`${prefix}_mg_per_kg`]: method.mgPerKg,
    [`${prefix}_threshold_mg_per_kg`]: method.thresholdMgPerKg,
    [`${prefix}_max_daily_mg`]: method.maxDailyDoseMg,
    [`${prefix}_status`]: method.status,
    [`${prefix}_delta_mg_per_kg`]: round(method.mgPerKg - method.thresholdMgPerKg, 2),
    [`${prefix}_within_guideline`]: method.status === 'within' ? 'Y' : 'N',
  };
}

function statusesDisagree(a: DoseStatus, b: DoseStatus): boolean {
  return a !== b;
}

function yesNoExport(value: string): string {
  return value === 'yes' || value === 'no' ? value : '';
}

function heightEntered(state: FormState): string {
  if (state.heightUnit === 'cm') return state.heightCm;
  return `${state.heightFt}'${state.heightIn}"`;
}

function countByStatus(methods: MethodResult[], status: DoseStatus): number {
  return methods.filter((m) => m.status === status).length;
}

export function buildResearchAssessments(patientInput: PatientInput): {
  assessmentUi: HcqAssessment;
  assessmentNhlbi: HcqAssessment;
  assessmentDevine: HcqAssessment;
} {
  return {
    assessmentUi: assessHcqDose(patientInput, 'nhlbi'),
    assessmentNhlbi: assessHcqDose(patientInput, 'nhlbi'),
    assessmentDevine: assessHcqDose(patientInput, 'devine'),
  };
}

export function buildResearchRow(input: BuildResearchRowInput): ResearchRow {
  const { formState, patientInput, layoutUsed, meta } = input;
  const assessmentUi = assessHcqDose(patientInput, formState.ibwAlgorithm);
  const assessmentNhlbi = assessHcqDose(patientInput, 'nhlbi');
  const assessmentDevine = assessHcqDose(patientInput, 'devine');
  const screening = getScreeningGuidance(assessmentUi, {
    renalDisease: formState.renalDisease,
    tamoxifen: formState.tamoxifen,
    macularPathology: formState.macularPathology,
    ageAtStartOver60: formState.ageAtStartOver60,
    hcqFiveYearsOrMore: formState.hcqFiveYearsOrMore,
  });

  const aao = getMethod(assessmentNhlbi, 'aao');
  const ibwNhlbi = getMethod(assessmentNhlbi, 'ibw');
  const ibwDevine = getMethod(assessmentDevine, 'ibw');
  const hybridNhlbi = getMethod(assessmentNhlbi, 'hybrid');
  const hybridDevine = getMethod(assessmentDevine, 'hybrid');
  const compareMethods = [aao, ibwNhlbi, ibwDevine, hybridNhlbi, hybridDevine];
  const { weeklyRegimen: w } = assessmentUi;

  const row: ResearchRow = {
    record_id: meta.recordId,
    export_timestamp: meta.timestamp,
    app_version: APP_VERSION,
    formula_version: FORMULA_VERSION,
    layout_used: layoutUsed,
    study_id: meta.studyId,
    site_id: meta.siteId,
    subject_id: meta.subjectId,
    encounter_date: meta.encounterDate,

    sex: patientInput.sex,
    height_cm: round(patientInput.heightCm, 1),
    height_entered: heightEntered(formState),
    height_unit: formState.heightUnit,
    weight_kg: round(patientInput.weightKg, 1),
    weight_entered: formState.weight,
    weight_unit: formState.weightUnit,
    daily_hcq_mg: patientInput.dailyDoseMg,
    ibw_algorithm_ui: formState.ibwAlgorithm,

    abw_kg: assessmentUi.abwKg,
    ibw_nhlbi_kg: assessmentNhlbi.ibwKg,
    ibw_devine_kg: assessmentDevine.ibwKg,
    dosing_weight_kg: assessmentUi.dosingWeightKg,
    dosing_weight_nhlbi_kg: assessmentNhlbi.dosingWeightKg,
    dosing_weight_devine_kg: assessmentDevine.dosingWeightKg,
    bmi: assessmentUi.bmi,
    severe_obesity_bmi35: assessmentUi.bmi >= 35 ? 'Y' : 'N',

    ...methodRowFields('aao_abw', aao),
    ...methodRowFields('ibw_nhlbi', ibwNhlbi),
    ...methodRowFields('ibw_devine', ibwDevine),
    ...methodRowFields('hybrid_nhlbi', hybridNhlbi),
    ...methodRowFields('hybrid_devine', hybridDevine),

    methods_within_count: countByStatus(compareMethods, 'within'),
    methods_exceed_count: countByStatus(compareMethods, 'exceeds'),
    any_method_exceeds: compareMethods.some((m) => m.status === 'exceeds') ? 'Y' : 'N',
    aao_vs_ibw_nhlbi_disagree: statusesDisagree(aao.status, ibwNhlbi.status) ? 'Y' : 'N',
    aao_vs_ibw_devine_disagree: statusesDisagree(aao.status, ibwDevine.status) ? 'Y' : 'N',
    aao_vs_hybrid_nhlbi_disagree: statusesDisagree(aao.status, hybridNhlbi.status) ? 'Y' : 'N',
    aao_vs_hybrid_devine_disagree: statusesDisagree(aao.status, hybridDevine.status) ? 'Y' : 'N',
    ibw_nhlbi_vs_devine_disagree: statusesDisagree(ibwNhlbi.status, ibwDevine.status) ? 'Y' : 'N',

    cap400_applicable: assessmentUi.bmi >= 35 ? 'Y' : 'N',
    cap400_exceeded: assessmentUi.cap400Warning ? 'Y' : 'N',
    cap400_message: assessmentUi.cap400Message ?? '',

    max_weekly_abw_mg: w.maxWeeklyAbwMg,
    max_weekly_ibw_mg: w.maxWeeklyIbwMg,
    governing_weekly_mg: w.governingWeeklyMg,
    governing_method: w.governingMethod,
    days_at_400mg: w.daysAt400,
    days_at_200mg: w.daysAt200,
    off_days: w.offDays,
    schedule_summary: w.scheduleSummary,
    current_weekly_mg: w.currentWeeklyMg,
    current_exceeds_safe: w.currentExceedsSafe ? 'Y' : 'N',

    renal_disease: yesNoExport(formState.renalDisease),
    tamoxifen: yesNoExport(formState.tamoxifen),
    macular_pathology: yesNoExport(formState.macularPathology),
    hcq_started_after_60: yesNoExport(formState.ageAtStartOver60),
    on_hcq_ge_5_years: yesNoExport(formState.hcqFiveYearsOrMore),
    risk_factors_complete: screening.riskFactorsComplete ? 'Y' : 'N',
    identified_risk_count: screening.identifiedRiskFactors.length,
    identified_risk_factors: screening.identifiedRiskFactors.map((r) => r.label).join('; '),
    elevated_screening_risk: screening.elevatedRisk ? 'Y' : 'N',
    annual_screening_recommended: screening.annualScreening ? 'Y' : 'N',
    defer_first_5_years: screening.deferFirstFiveYears ? 'Y' : 'N',

    dose_narrative: assessmentUi.narrative,
    tablet_note: assessmentUi.tabletNote,
  };

  return row;
}

export function buildResearchRowFromState(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
  subjectId: string,
  studyId: string,
  siteId: string,
  recordId: string,
  encounterDate: string,
): ResearchRow {
  return buildResearchRow({
    formState,
    patientInput,
    layoutUsed,
    meta: {
      recordId,
      timestamp: new Date().toISOString(),
      layoutUsed,
      studyId,
      siteId,
      subjectId,
      encounterDate,
    },
  });
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getScreeningForExport(
  formState: FormState,
  assessment: HcqAssessment,
): ScreeningGuidance {
  return getScreeningGuidance(assessment, {
    renalDisease: formState.renalDisease,
    tamoxifen: formState.tamoxifen,
    macularPathology: formState.macularPathology,
    ageAtStartOver60: formState.ageAtStartOver60,
    hcqFiveYearsOrMore: formState.hcqFiveYearsOrMore,
  });
}
