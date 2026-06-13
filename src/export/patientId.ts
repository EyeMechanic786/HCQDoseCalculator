import { DRAFT_PATIENT_ID_KEY } from './constants.ts';
import { getStudyLog, updateSavedIdsList } from './studyLog.ts';

/** Default suggestion when no numeric IDs exist in the log. */
export const PATIENT_ID_START = 10;

const PATIENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,20}$/;

export function formatPatientId(sequence: number): string {
  return String(sequence).padStart(6, '0');
}

export function normalizePatientId(raw: string): string {
  return raw.trim();
}

export function readPatientIdInput(): string {
  const input = document.getElementById('research-patient-id') as HTMLInputElement | null;
  return normalizePatientId(input?.value ?? loadDraftPatientId());
}

export function saveDraftPatientId(id: string): void {
  try {
    sessionStorage.setItem(DRAFT_PATIENT_ID_KEY, normalizePatientId(id));
  } catch {
    /* ignore */
  }
}

export function loadDraftPatientId(): string {
  try {
    const draft = sessionStorage.getItem(DRAFT_PATIENT_ID_KEY);
    if (draft && normalizePatientId(draft)) return normalizePatientId(draft);
  } catch {
    /* ignore */
  }
  return getSuggestedPatientId();
}

export function clearDraftPatientId(): void {
  try {
    sessionStorage.removeItem(DRAFT_PATIENT_ID_KEY);
  } catch {
    /* ignore */
  }
}

/** Suggest the next six-digit ID based on IDs already saved this session. */
export function getSuggestedPatientId(): string {
  const log = getStudyLog();
  let maxNumeric = PATIENT_ID_START - 1;

  for (const row of log) {
    const id = String(row.patient_id);
    if (/^\d{1,6}$/.test(id)) {
      maxNumeric = Math.max(maxNumeric, parseInt(id, 10));
    }
  }

  return formatPatientId(Math.max(maxNumeric + 1, PATIENT_ID_START));
}

export function isPatientIdUsed(patientId: string, log: { patient_id?: string | number }[]): boolean {
  const normalized = normalizePatientId(patientId).toLowerCase();
  return log.some((row) => normalizePatientId(String(row.patient_id)).toLowerCase() === normalized);
}

export function validatePatientId(
  patientId: string,
  log: { patient_id?: string | number }[] = getStudyLog(),
): string | null {
  const id = normalizePatientId(patientId);

  if (!id) {
    return 'Enter a unique Patient ID before saving this case.';
  }
  if (!PATIENT_ID_PATTERN.test(id)) {
    return 'Patient ID must be 1–20 characters: letters, numbers, hyphens, or underscores only.';
  }
  if (isPatientIdUsed(id, log)) {
    return `Patient ID "${id}" is already saved. Enter a different ID for each patient.`;
  }
  return null;
}

export function showPatientIdError(message: string | null): void {
  const errorEl = document.getElementById('research-patient-id-error');
  const input = document.getElementById('research-patient-id') as HTMLInputElement | null;
  if (!errorEl || !input) return;

  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    switchResearchTabSafe('patient-id');
  } else {
    errorEl.textContent = '';
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');
  }
}

function switchResearchTabSafe(tabId: string): void {
  if (typeof document.querySelectorAll !== 'function') return;
  document.querySelectorAll<HTMLElement>('[data-research-tab]').forEach((tab) => {
    const isActive = tab.dataset.researchTab === tabId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll<HTMLElement>('[data-research-panel]').forEach((panel) => {
    const isActive = panel.dataset.researchPanel === tabId;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

/** After a successful save, suggest the next ID in the input for the clinician to confirm or edit. */
export function prepareNextPatientIdInput(): void {
  const input = document.getElementById('research-patient-id') as HTMLInputElement | null;
  const suggested = getSuggestedPatientId();
  saveDraftPatientId(suggested);
  if (!input) return;
  input.value = suggested;
  input.placeholder = suggested;
  showPatientIdError(null);
  updateSavedIdsList();
}

export function resetPatientIdInput(): void {
  const input = document.getElementById('research-patient-id') as HTMLInputElement | null;
  if (!input) return;
  input.value = getSuggestedPatientId();
  input.placeholder = 'e.g. 000010';
  showPatientIdError(null);
}

export function resetPatientIdSequence(): void {
  resetPatientIdInput();
}

export function updatePatientIdDisplay(): void {
  prepareNextPatientIdInput();
}
