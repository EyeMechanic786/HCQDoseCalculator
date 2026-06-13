import { PATIENT_ID_SEQ_STORAGE_KEY } from './constants.ts';

/** First anonymous patient ID in a session (000010). */
export const PATIENT_ID_START = 10;

/** In-memory fallback when sessionStorage is blocked (e.g. some private modes). */
let memorySequence: number | null = null;

export function formatPatientId(sequence: number): string {
  return String(sequence).padStart(6, '0');
}

function readStoredSequence(): number | null {
  try {
    const stored = sessionStorage.getItem(PATIENT_ID_SEQ_STORAGE_KEY);
    if (stored === null) return null;
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) && parsed >= PATIENT_ID_START ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredSequence(sequence: number): void {
  memorySequence = sequence;
  try {
    sessionStorage.setItem(PATIENT_ID_SEQ_STORAGE_KEY, String(sequence));
  } catch {
    /* sessionStorage unavailable — memorySequence remains the source of truth */
  }
}

export function getNextPatientIdSequence(): number {
  const stored = readStoredSequence();
  if (stored !== null) {
    memorySequence = stored;
    return stored;
  }
  if (memorySequence !== null && memorySequence >= PATIENT_ID_START) {
    return memorySequence;
  }
  return PATIENT_ID_START;
}

/** ID for the current in-progress patient (does not advance the counter). */
export function getCurrentPatientId(): string {
  return formatPatientId(getNextPatientIdSequence());
}

/** Assign ID for this case and advance the session counter for the next patient. */
export function allocatePatientId(): string {
  const sequence = getNextPatientIdSequence();
  const assigned = formatPatientId(sequence);
  writeStoredSequence(sequence + 1);
  updatePatientIdDisplay();
  return assigned;
}

export function resetPatientIdSequence(): void {
  memorySequence = null;
  try {
    sessionStorage.removeItem(PATIENT_ID_SEQ_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  updatePatientIdDisplay();
}

export function updatePatientIdDisplay(): void {
  const display = document.getElementById('research-patient-id');
  if (display) display.textContent = getCurrentPatientId();
}

/** True if this patient_id is already present in the study log. */
export function isPatientIdUsed(patientId: string, log: { patient_id?: string | number }[]): boolean {
  return log.some((row) => String(row.patient_id) === patientId);
}
