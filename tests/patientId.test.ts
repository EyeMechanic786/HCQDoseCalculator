import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PATIENT_ID_START,
  allocatePatientId,
  formatPatientId,
  getCurrentPatientId,
  getNextPatientIdSequence,
  resetPatientIdSequence,
} from '../src/export/patientId.ts';

function mockSessionStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
  vi.stubGlobal('document', { getElementById: () => null });
}

describe('patientId', () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it('formats IDs as six-digit zero-padded strings', () => {
    expect(formatPatientId(10)).toBe('000010');
    expect(formatPatientId(11)).toBe('000011');
    expect(formatPatientId(123456)).toBe('123456');
  });

  it('starts at 000010 for a new session', () => {
    expect(getNextPatientIdSequence()).toBe(PATIENT_ID_START);
    expect(getCurrentPatientId()).toBe('000010');
  });

  it('allocates sequential IDs', () => {
    expect(allocatePatientId()).toBe('000010');
    expect(allocatePatientId()).toBe('000011');
    expect(getCurrentPatientId()).toBe('000012');
  });

  it('uses memory fallback when sessionStorage throws', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });
    resetPatientIdSequence();
    expect(allocatePatientId()).toBe('000010');
    expect(allocatePatientId()).toBe('000011');
    expect(getCurrentPatientId()).toBe('000012');
  });
});
