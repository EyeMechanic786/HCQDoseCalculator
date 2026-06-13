import { describe, expect, it } from 'vitest';
import { buildResearchRow, buildStudyDataRow } from '../src/export/buildResearchRow.ts';
import { RESEARCH_COLUMNS, STUDY_DATA_COLUMNS } from '../src/export/columnSchema.ts';
import { defaultFormState, type FormState } from '../src/ui/calculatorForm.ts';

const referenceInput = {
  sex: 'female' as const,
  heightCm: 163,
  weightKg: 73,
  dailyDoseMg: 400,
};

const referenceForm: FormState = {
  ...defaultFormState,
  sex: 'female',
  heightCm: '163',
  weight: '73',
  dailyDoseMg: '400',
  hcqDurationYears: '8',
  ibwAlgorithm: 'nhlbi',
  renalDisease: 'no',
  tamoxifen: 'no',
  macularPathology: 'no',
  ageAtStartOver60: 'no',
  hcqFiveYearsOrMore: 'yes',
  hcqTwentyYearsOrMore: 'no',
};

const referenceMeta = {
  recordId: 'HCQ-TEST-0001',
  timestamp: '2026-06-13T10:00:00.000Z',
  layoutUsed: 'dashboard' as const,
  studyId: 'TEST-STUDY',
  siteId: 'Site-A',
  patientId: '000010',
  encounterDate: '2026-06-13',
};

describe('buildStudyDataRow', () => {
  it('includes all nine Study_Data columns', () => {
    const row = buildStudyDataRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'dashboard',
      meta: referenceMeta,
    });

    for (const col of STUDY_DATA_COLUMNS) {
      expect(row[col.key]).toBeDefined();
    }
  });

  it('maps patient fields and computed safe dose range', () => {
    const row = buildStudyDataRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'dashboard',
      meta: referenceMeta,
    });

    expect(row.patient_id).toBe('000010');
    expect(row.gender).toBe('Female');
    expect(row.hcq_duration_years).toBe(8);
    expect(row.daily_hcq_mg).toBe(400);
    expect(row.abw_kg).toBe(73);
    expect(row.height_cm).toBe(163);
    expect(row.bmi).toBe(27.5);
    expect(row.ibw_kg).toBe(63.7);
    expect(row.safe_dose_range).toBe('318–414 mg/day');
  });
});

describe('buildResearchRow', () => {
  it('includes all Detailed_Data schema columns', () => {
    const row = buildResearchRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'dashboard',
      meta: referenceMeta,
    });

    for (const col of RESEARCH_COLUMNS) {
      expect(row[col.key]).toBeDefined();
    }
  });

  it('computes both IBW algorithms independently', () => {
    const row = buildResearchRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'dashboard',
      meta: { ...referenceMeta, recordId: 'HCQ-TEST-0002' },
    });

    expect(row.patient_id).toBe('000010');
    expect(row.ibw_nhlbi_kg).toBe(63.7);
    expect(row.ibw_devine_kg).toBe(55.1);
    expect(row.ibw_kg).toBe(63.7);
    expect(row.safe_dose_range).toBe('318–414 mg/day');
    expect(row.aao_abw_status).toBe('caution');
    expect(row.ibw_nhlbi_status).toBe('within');
    expect(typeof row.methods_within_count).toBe('number');
    expect(row.any_method_exceeds).toBe('Y');
  });

  it('flags disagreement between AAO and IBW methods', () => {
    const row = buildResearchRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'bedside',
      meta: { ...referenceMeta, recordId: 'HCQ-TEST-0003', patientId: '000011' },
    });

    expect(row.aao_vs_ibw_nhlbi_disagree).toBe('Y');
    expect(row.layout_used).toBe('bedside');
    expect(row.risk_factors_complete).toBe('Y');
    expect(row.identified_risk_count).toBe(1);
  });
});

describe('RESEARCH_COLUMNS', () => {
  it('has unique column keys', () => {
    const keys = RESEARCH_COLUMNS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('STUDY_DATA_COLUMNS', () => {
  it('has unique column keys', () => {
    const keys = STUDY_DATA_COLUMNS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(9);
  });
});
