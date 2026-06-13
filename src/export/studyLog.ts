import {
  RECORD_SEQ_STORAGE_KEY,
  STUDY_LOG_STORAGE_KEY,
} from './constants.ts';
import type { ResearchRow } from './columnSchema.ts';

/** In-memory fallback when sessionStorage is unavailable. */
let memoryLog: ResearchRow[] = [];

function nextRecordId(): string {
  const seq = parseInt(sessionStorage.getItem(RECORD_SEQ_STORAGE_KEY) ?? '0', 10) + 1;
  try {
    sessionStorage.setItem(RECORD_SEQ_STORAGE_KEY, String(seq));
  } catch {
    /* ignore */
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `HCQ-${date}-${String(seq).padStart(4, '0')}`;
}

function loadRawLog(): ResearchRow[] {
  try {
    const raw = sessionStorage.getItem(STUDY_LOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ResearchRow[];
      if (Array.isArray(parsed)) {
        memoryLog = parsed;
        return parsed;
      }
    }
  } catch {
    /* fall through to memory */
  }
  return memoryLog;
}

function saveRawLog(rows: ResearchRow[]): void {
  memoryLog = rows;
  try {
    sessionStorage.setItem(STUDY_LOG_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* memoryLog remains authoritative */
  }
}

export function getStudyLog(): ResearchRow[] {
  return loadRawLog();
}

export function getLogCount(): number {
  return loadRawLog().length;
}

export function addToStudyLog(row: ResearchRow): void {
  const log = loadRawLog();
  log.push(row);
  saveRawLog(log);
}

export function clearStudyLog(): void {
  memoryLog = [];
  try {
    sessionStorage.removeItem(STUDY_LOG_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getSavedPatientIds(): string[] {
  return loadRawLog().map((row) => String(row.patient_id));
}

export function createRecordId(): string {
  return nextRecordId();
}

export function updateLogBadge(): void {
  const badge = document.getElementById('research-log-count');
  if (!badge) return;
  const count = getLogCount();
  badge.textContent = String(count);
  badge.classList.toggle('research-export__badge--empty', count === 0);
}

export function updateSavedIdsList(): void {
  const list = document.getElementById('research-saved-ids');
  if (!list) return;
  const ids = getSavedPatientIds();
  if (ids.length === 0) {
    list.textContent = 'No patients saved yet this session.';
    return;
  }
  list.textContent = `Saved this session: ${ids.join(', ')}`;
}
