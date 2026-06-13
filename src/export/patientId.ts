import { PATIENT_ID_SEQ_STORAGE_KEY } from './constants.ts';

/** First anonymous patient ID in a session (000010). */
export const PATIENT_ID_START = 10;

export function formatPatientId(sequence: number): string {
  return String(sequence).padStart(6, '0');
}

export function getNextPatientIdSequence(): number {
  const stored = sessionStorage.getItem(PATIENT_ID_SEQ_STORAGE_KEY);
  if (stored === null) return PATIENT_ID_START;
  const parsed = parseInt(stored, 10);
  return Number.isFinite(parsed) && parsed >= PATIENT_ID_START ? parsed : PATIENT_ID_START;
}

/** ID assigned to the current entry (does not advance the counter). */
export function getCurrentPatientId(): string {
  return formatPatientId(getNextPatientIdSequence());
}

/** Assign ID for this case and advance the session counter for the next patient. */
export function allocatePatientId(): string {
  const sequence = getNextPatientIdSequence();
  sessionStorage.setItem(PATIENT_ID_SEQ_STORAGE_KEY, String(sequence + 1));
  updatePatientIdDisplay();
  return formatPatientId(sequence);
}

export function resetPatientIdSequence(): void {
  sessionStorage.removeItem(PATIENT_ID_SEQ_STORAGE_KEY);
  updatePatientIdDisplay();
}

export function updatePatientIdDisplay(): void {
  const display = document.getElementById('research-patient-id');
  if (display) display.textContent = getCurrentPatientId();
}
