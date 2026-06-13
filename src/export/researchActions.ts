import { buildResearchRowFromState, todayIsoDate } from './buildResearchRow.ts';
import {
  prepareNextPatientIdInput,
  readPatientIdInput,
  resetPatientIdInput,
  showPatientIdError,
  validatePatientId,
} from './patientId.ts';
import { readStudyMetaFromDom } from './studyMeta.ts';
import {
  addToStudyLog,
  clearStudyLog,
  createRecordId,
  getStudyLog,
  updateLogBadge,
  updateSavedIdsList,
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

export function commitPatientRow(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
  patientId: string,
): { ok: true; row: ResearchRow; patientId: string } | { ok: false; message: string } {
  const validationError = validatePatientId(patientId);
  if (validationError) {
    showPatientIdError(validationError);
    return { ok: false, message: validationError };
  }

  showPatientIdError(null);
  const row = buildCurrentResearchRow(formState, patientInput, layoutUsed, patientId);
  return { ok: true, row, patientId };
}

export function handleAddToStudyLog(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
): ResearchExportResult {
  const patientId = readPatientIdInput();
  const committed = commitPatientRow(formState, patientInput, layoutUsed, patientId);
  if (!committed.ok) {
    return { success: false, message: committed.message };
  }

  addToStudyLog(committed.row);
  updateLogBadge();
  updateSavedIdsList();
  prepareNextPatientIdInput();

  return {
    success: true,
    message: `Patient ${committed.patientId} saved to study log (${getStudyLog().length} total). Enter the next unique Patient ID before saving another case.`,
  };
}

export async function handleDownloadWorkbook(
  _formState: FormState,
  _patientInput: PatientInput | null,
  _layoutUsed: AppDesign,
  _includeCurrentIfValid: boolean,
): Promise<ResearchExportResult> {
  const meta = readStudyMetaFromDom();
  const rows = getStudyLog();

  if (rows.length === 0) {
    return {
      success: false,
      message: 'Study log is empty. Enter a unique Patient ID and save each case before downloading.',
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
  const patientId = readPatientIdInput();
  const committed = commitPatientRow(formState, patientInput, layoutUsed, patientId);
  if (!committed.ok) {
    return { success: false, message: committed.message };
  }

  addToStudyLog(committed.row);
  updateLogBadge();
  updateSavedIdsList();
  prepareNextPatientIdInput();

  try {
    const { exportResearchWorkbook } = await import('./excelWorkbook.ts');
    await exportResearchWorkbook([committed.row], meta.studyId, meta.siteId);
    return {
      success: true,
      message: `Exported Patient ${committed.patientId} to Excel and added to session log (${getStudyLog().length} total).`,
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
      'Clear all cases from the study log? You will need to enter new Patient IDs for each case. This cannot be undone.',
    )
  ) {
    return { success: false, message: 'Clear cancelled.' };
  }
  clearStudyLog();
  resetPatientIdInput();
  updateLogBadge();
  updateSavedIdsList();
  return { success: true, message: 'Study log cleared. Enter a unique Patient ID for the next case.' };
}

function validateUniquePatientIds(rows: ResearchRow[]): {
  ok: boolean;
  result: ResearchExportResult;
} {
  const patientIds = rows.map((row) => String(row.patient_id).toLowerCase());
  if (new Set(patientIds).size === patientIds.length) {
    return { ok: true, result: { success: true, message: '' } };
  }
  return {
    ok: false,
    result: {
      success: false,
      message: 'Duplicate Patient IDs in the study log. Clear the log and re-save each case with a unique ID.',
    },
  };
}
