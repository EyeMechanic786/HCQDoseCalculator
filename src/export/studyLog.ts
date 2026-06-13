import {
  RECORD_SEQ_STORAGE_KEY,
  STUDY_LOG_STORAGE_KEY,
} from './constants.ts';
import type { ResearchRow } from './columnSchema.ts';

function nextRecordId(): string {
  const seq = parseInt(sessionStorage.getItem(RECORD_SEQ_STORAGE_KEY) ?? '0', 10) + 1;
  sessionStorage.setItem(RECORD_SEQ_STORAGE_KEY, String(seq));
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `HCQ-${date}-${String(seq).padStart(4, '0')}`;
}

function loadRawLog(): ResearchRow[] {
  try {
    const raw = sessionStorage.getItem(STUDY_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResearchRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRawLog(rows: ResearchRow[]): void {
  sessionStorage.setItem(STUDY_LOG_STORAGE_KEY, JSON.stringify(rows));
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
  sessionStorage.removeItem(STUDY_LOG_STORAGE_KEY);
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
