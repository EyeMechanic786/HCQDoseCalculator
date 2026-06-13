import { buildResearchRowFromState, todayIsoDate } from './buildResearchRow.ts';
import {
  allocatePatientId,
  getCurrentPatientId,
  isPatientIdUsed,
  resetPatientIdSequence,
  updatePatientIdDisplay,
} from './patientId.ts';
import { readStudyMetaFromDom } from './studyMeta.ts';
import {
  addToStudyLog,
  clearStudyLog,
  createRecordId,
  getStudyLog,
  updateLogBadge,
} from './studyLog.ts';
import type { ResearchRow } from './columnSchema.ts';
import type { FormState } from '../ui/calculatorForm.ts';
import type { AppDesign, PatientInput } from '../types.ts';

export interface ResearchExportResult {
  success: boolean;
  message: string;
}

function readEncounterDate(): string {
  const value = (document.getElementById('research-encounter-date') as HTMLInputElement)?.value;
  return value || todayIsoDate();
}

export function buildCurrentResearchRow(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
  patientId: string,
): ResearchRow {
  const meta = readStudyMetaFromDom();
  return buildResearchRowFromState(
    formState,
    patientInput,
    layoutUsed,
    patientId,
    meta.studyId,
    meta.siteId,
    createRecordId(),
    readEncounterDate(),
  );
}

/** Assign a unique patient ID and build a research row. */
export function commitPatientRow(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
): { row: ResearchRow; patientId: string } {
  const log = getStudyLog();
  let patientId = allocatePatientId();

  while (isPatientIdUsed(patientId, log)) {
    patientId = allocatePatientId();
  }

  const row = buildCurrentResearchRow(formState, patientInput, layoutUsed, patientId);
  return { row, patientId };
}

export function handleAddToStudyLog(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
): ResearchExportResult {
  const { row, patientId } = commitPatientRow(formState, patientInput, layoutUsed);
  addToStudyLog(row);
  updateLogBadge();
  updatePatientIdDisplay();
  return {
    success: true,
    message: `Patient ${patientId} saved to study log (${getStudyLog().length} total). Next Patient ID: ${getCurrentPatientId()}.`,
  };
}

export async function handleDownloadWorkbook(
  formState: FormState,
  patientInput: PatientInput | null,
  layoutUsed: AppDesign,
  includeCurrentIfValid: boolean,
): Promise<ResearchExportResult> {
  const meta = readStudyMetaFromDom();
  let rows = [...getStudyLog()];

  if (rows.length === 0 && includeCurrentIfValid && patientInput) {
    const { row } = commitPatientRow(formState, patientInput, layoutUsed);
    rows = [row];
  }

  if (rows.length === 0) {
    return {
      success: false,
      message: 'Study log is empty. Save patients to the log or enter valid data before exporting.',
    };
  }

  const duplicateCheck = validateUniquePatientIds(rows);
  if (!duplicateCheck.ok) return duplicateCheck.result;

  try {
    const { exportResearchWorkbook } = await import('./excelWorkbook.ts');
    await exportResearchWorkbook(rows, meta.studyId, meta.siteId);
    return {
      success: true,
      message: `Downloaded ${rows.length} case${rows.length === 1 ? '' : 's'} to Excel.`,
    };
  } catch {
    return {
      success: false,
      message: 'Excel export failed. Try again or use a different browser.',
    };
  }
}

export async function handleExportCurrentCase(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
): Promise<ResearchExportResult> {
  const meta = readStudyMetaFromDom();
  const { row, patientId } = commitPatientRow(formState, patientInput, layoutUsed);

  try {
    const { exportResearchWorkbook } = await import('./excelWorkbook.ts');
    await exportResearchWorkbook([row], meta.studyId, meta.siteId);
    return {
      success: true,
      message: `Exported Patient ${patientId} to Excel. Next Patient ID: ${getCurrentPatientId()}.`,
    };
  } catch {
    return {
      success: false,
      message: 'Excel export failed. Try again or use a different browser.',
    };
  }
}

export function handleClearStudyLog(): ResearchExportResult {
  if (getStudyLog().length === 0) {
    return { success: false, message: 'Study log is already empty.' };
  }
  if (
    !window.confirm(
      'Clear all cases from the study log? Patient ID sequence will reset to 000010. This cannot be undone.',
    )
  ) {
    return { success: false, message: 'Clear cancelled.' };
  }
  clearStudyLog();
  resetPatientIdSequence();
  updateLogBadge();
  updatePatientIdDisplay();
  return { success: true, message: 'Study log cleared. Next Patient ID: 000010.' };
}

function validateUniquePatientIds(rows: ResearchRow[]): {
  ok: boolean;
  result: ResearchExportResult;
} {
  const patientIds = rows.map((row) => String(row.patient_id));
  if (new Set(patientIds).size === patientIds.length) {
    return { ok: true, result: { success: true, message: '' } };
  }
  return {
    ok: false,
    result: {
      success: false,
      message: 'Duplicate Patient IDs in the study log. Clear the log and re-save cases.',
    },
  };
}

export function formFingerprint(input: PatientInput): string {
  return `${input.sex}|${roundInput(input.heightCm)}|${roundInput(input.weightKg)}|${input.dailyDoseMg}`;
}

function roundInput(n: number): number {
  return Math.round(n * 10) / 10;
}
