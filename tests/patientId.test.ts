import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatPatientId,
  getSuggestedPatientId,
  resetPatientIdSequence,
  validatePatientId,
} from '../src/export/patientId.ts';
import { clearStudyLog, addToStudyLog } from '../src/export/studyLog.ts';

function mockBrowser(): void {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
  vi.stubGlobal('document', { getElementById: () => null });
}

describe('patientId validation', () => {
  beforeEach(() => {
    mockBrowser();
    clearStudyLog();
  });

  it('formats IDs as six-digit zero-padded strings', () => {
    expect(formatPatientId(10)).toBe('000010');
    expect(formatPatientId(11)).toBe('000011');
  });

  it('requires a non-empty unique ID', () => {
    expect(validatePatientId('')).toMatch(/Enter a unique/);
    expect(validatePatientId('000010', [])).toBeNull();
    expect(validatePatientId('000010', [{ patient_id: '000010' }])).toMatch(/already saved/);
  });

  it('rejects invalid characters', () => {
    expect(validatePatientId('Patient 1')).toMatch(/letters, numbers/);
    expect(validatePatientId('SITE-A-001')).toBeNull();
  });

  it('suggests the next numeric ID from the saved log', () => {
    expect(getSuggestedPatientId()).toBe('000010');
    addToStudyLog({ patient_id: '000010' } as never);
    expect(getSuggestedPatientId()).toBe('000011');
    addToStudyLog({ patient_id: '000011' } as never);
    expect(getSuggestedPatientId()).toBe('000012');
  });

  it('resets draft input suggestion', () => {
    resetPatientIdSequence();
    expect(getSuggestedPatientId()).toBe('000010');
  });
});
