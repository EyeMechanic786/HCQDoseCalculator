import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultFormState, type FormState } from '../src/ui/calculatorForm.ts';
import { commitPatientRow, handleAddToStudyLog } from '../src/export/researchActions.ts';
import { getStudyLog, clearStudyLog } from '../src/export/studyLog.ts';
import { getCurrentPatientId, resetPatientIdSequence } from '../src/export/patientId.ts';

const patientA = {
  sex: 'female' as const,
  heightCm: 163,
  weightKg: 73,
  dailyDoseMg: 400,
};

const patientB = {
  sex: 'female' as const,
  heightCm: 170,
  weightKg: 80,
  dailyDoseMg: 300,
};

const formState: FormState = { ...defaultFormState };

function mockBrowserStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
  vi.stubGlobal('document', {
    getElementById: (id: string) => {
      if (id === 'research-encounter-date') return { value: '2026-06-13' };
      if (id === 'research-study-id') return { value: '' };
      if (id === 'research-site-id') return { value: '' };
      if (id === 'research-patient-id') return { textContent: '' };
      return null;
    },
  });
}

describe('research patient ID assignment', () => {
  beforeEach(() => {
    mockBrowserStorage();
    clearStudyLog();
    resetPatientIdSequence();
  });

  it('assigns sequential unique patient IDs across multiple saves', () => {
    const first = commitPatientRow(formState, patientA, 'dashboard');
    const second = commitPatientRow(formState, patientB, 'dashboard');

    expect(first.patientId).toBe('000010');
    expect(second.patientId).toBe('000011');
    expect(first.row.patient_id).toBe('000010');
    expect(second.row.patient_id).toBe('000011');
    expect(getCurrentPatientId()).toBe('000012');
  });

  it('stores unique patient IDs in the study log via handleAddToStudyLog', () => {
    handleAddToStudyLog(formState, patientA, 'dashboard');
    handleAddToStudyLog(formState, patientB, 'dashboard');

    const log = getStudyLog();
    expect(log).toHaveLength(2);
    expect(log[0]?.patient_id).toBe('000010');
    expect(log[1]?.patient_id).toBe('000011');
  });
});
