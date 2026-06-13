export type Sex = 'female' | 'male';

export type HeightUnit = 'cm' | 'ftin';
export type WeightUnit = 'kg' | 'lb';

export type IbwAlgorithm = 'nhlbi' | 'devine';

export type AppDesign = 'dashboard' | 'bedside';

export type DoseStatus = 'within' | 'exceeds' | 'caution';

/** Explicit clinician response required for each screening risk factor. */
export type YesNo = '' | 'yes' | 'no';

export type RetinalToxicityLevel = '' | 'Absent' | 'Probable' | 'Definite';

export interface PatientInput {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  dailyDoseMg: number;
}

export interface MethodResult {
  id: string;
  label: string;
  thresholdLabel: string;
  mgPerKg: number;
  thresholdMgPerKg: number;
  maxDailyDoseMg: number;
  status: DoseStatus;
  summary: string;
}

export interface WeeklyRegimen {
  maxWeeklyAbwMg: number;
  maxWeeklyIbwMg: number;
  governingWeeklyMg: number;
  governingMethod: 'abw' | 'ibw';
  governingMethodLabel: string;
  maxDailyEquivalentMg: number;
  daysAt400: number;
  daysAt200: number;
  offDays: number;
  scheduleSummary: string;
  currentWeeklyMg: number;
  currentExceedsSafe: boolean;
}

export interface HcqAssessment {
  abwKg: number;
  ibwKg: number;
  ibwAlgorithm: IbwAlgorithm;
  dosingWeightKg: number;
  bmi: number;
  dailyDoseMg: number;
  mgPerKgAbw: number;
  mgPerKgIbw: number;
  mgPerKgHybrid: number;
  methods: MethodResult[];
  cap400Warning: boolean;
  cap400Message: string | null;
  tabletNote: string;
  narrative: string;
  weeklyRegimen: WeeklyRegimen;
}

export interface ScreeningRiskFactors {
  renalDisease: YesNo;
  tamoxifen: YesNo;
  macularPathology: YesNo;
  ageAtStartOver60: YesNo;
  hcqFiveYearsOrMore: YesNo;
  hcqTwentyYearsOrMore: YesNo;
}

export interface IdentifiedRiskFactor {
  id: string;
  label: string;
}

export interface ScreeningGuidance {
  baselineRequired: boolean;
  annualScreening: boolean;
  deferFirstFiveYears: boolean;
  elevatedRisk: boolean;
  riskFactorsComplete: boolean;
  identifiedRiskFactors: IdentifiedRiskFactor[];
  showRiskFactorWarning: boolean;
  riskFactorWarningMessage: string | null;
  recommendations: string[];
  rcophthNote: string;
  riskNotes: string[];
}
