import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultFormState, type FormState } from '../src/ui/calculatorForm.ts';
import { commitPatientRow, handleAddToStudyLog } from '../src/export/researchActions.ts';
import { getStudyLog, clearStudyLog, addToStudyLog } from '../src/export/studyLog.ts';
import { resetPatientIdSequence } from '../src/export/patientId.ts';

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

function mockPatientIdInput(value: string): void {
  vi.stubGlobal('document', {
    getElementById: (id: string) => {
      if (id === 'research-encounter-date') return { value: '2026-06-13' };
      if (id === 'research-study-id') return { value: '' };
      if (id === 'research-site-id') return { value: '' };
      if (id === 'research-patient-id') {
        return {
          value,
          placeholder: '',
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
          focus: vi.fn(),
        };
      }
      if (id === 'research-patient-id-error') {
        return { textContent: '', hidden: true };
      }
      if (id === 'research-saved-ids') return { textContent: '' };
      return null;
    },
  });
}

function mockSessionStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
}

describe('research patient ID assignment', () => {
  beforeEach(() => {
    mockSessionStorage();
    mockPatientIdInput('000010');
    clearStudyLog();
    resetPatientIdSequence();
  });

  it('rejects duplicate clinician-entered patient IDs', () => {
    const first = commitPatientRow(formState, patientA, 'dashboard', '000010');
    expect(first.ok).toBe(true);
    if (first.ok) addToStudyLog(first.row);

    const duplicate = commitPatientRow(formState, patientB, 'dashboard', '000010');
    expect(duplicate.ok).toBe(false);
  });

  it('stores multiple unique patient IDs in the study log', () => {
    mockPatientIdInput('000010');
    handleAddToStudyLog(formState, patientA, 'dashboard');

    mockPatientIdInput('000011');
    handleAddToStudyLog(formState, patientB, 'dashboard');

    const log = getStudyLog();
    expect(log).toHaveLength(2);
    expect(log[0]?.patient_id).toBe('000010');
    expect(log[1]?.patient_id).toBe('000011');
  });
});
