import { describe, expect, it } from 'vitest';
import { buildResearchRow } from '../src/export/buildResearchRow.ts';
import { RESEARCH_COLUMNS } from '../src/export/columnSchema.ts';
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
  ibwAlgorithm: 'nhlbi',
  renalDisease: 'no',
  tamoxifen: 'no',
  macularPathology: 'no',
  ageAtStartOver60: 'no',
  hcqFiveYearsOrMore: 'yes',
  hcqTwentyYearsOrMore: 'no',
};

describe('buildResearchRow', () => {
  it('includes all schema columns', () => {
    const row = buildResearchRow({
      formState: referenceForm,
      patientInput: referenceInput,
      layoutUsed: 'dashboard',
      meta: {
        recordId: 'HCQ-TEST-0001',
        timestamp: '2026-06-13T10:00:00.000Z',
        layoutUsed: 'dashboard',
        studyId: 'TEST-STUDY',
        siteId: 'Site-A',
        patientId: '000010',
        encounterDate: '2026-06-13',
      },
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
      meta: {
        recordId: 'HCQ-TEST-0002',
        timestamp: '2026-06-13T10:00:00.000Z',
        layoutUsed: 'dashboard',
        studyId: '',
        siteId: '',
        patientId: '000010',
        encounterDate: '2026-06-13',
      },
    });

    expect(row.patient_id).toBe('000010');
    expect(row.ibw_nhlbi_kg).toBe(63.7);
    expect(row.ibw_devine_kg).toBe(55.1);
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
      meta: {
        recordId: 'HCQ-TEST-0003',
        timestamp: '2026-06-13T10:00:00.000Z',
        layoutUsed: 'bedside',
        studyId: '',
        siteId: '',
        patientId: '000011',
        encounterDate: '2026-06-13',
      },
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
