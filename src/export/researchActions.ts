import { buildResearchRowFromState, todayIsoDate } from './buildResearchRow.ts';
import { allocatePatientId, resetPatientIdSequence } from './patientId.ts';
import { readStudyMetaFromDom } from './studyMeta.ts';
import {
  addToStudyLog,
  clearStudyLog,
  createRecordId,
  getStudyLog,
  updateLogBadge,
} from './studyLog.ts';
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
) {
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

export function handleAddToStudyLog(
  formState: FormState,
  patientInput: PatientInput,
  layoutUsed: AppDesign,
): ResearchExportResult {
  const patientId = allocatePatientId();
  const row = buildCurrentResearchRow(formState, patientInput, layoutUsed, patientId);
  addToStudyLog(row);
  updateLogBadge();
  return {
    success: true,
    message: `Patient ${patientId} saved to study log (${getStudyLog().length} total).`,
  };
}

export async function handleDownloadWorkbook(
  formState: FormState,
  patientInput: PatientInput | null,
  layoutUsed: AppDesign,
  includeCurrentIfValid: boolean,
): Promise<ResearchExportResult> {
  const meta = readStudyMetaFromDom();
  let rows = getStudyLog();

  if (rows.length === 0 && includeCurrentIfValid && patientInput) {
    const patientId = allocatePatientId();
    rows = [buildCurrentResearchRow(formState, patientInput, layoutUsed, patientId)];
  }

  if (rows.length === 0) {
    return {
      success: false,
      message: 'Study log is empty. Add cases or enter valid patient data to export.',
    };
  }

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
  const patientId = allocatePatientId();
  const row = buildCurrentResearchRow(formState, patientInput, layoutUsed, patientId);

  try {
    const { exportResearchWorkbook } = await import('./excelWorkbook.ts');
    await exportResearchWorkbook([row], meta.studyId, meta.siteId);
    return {
      success: true,
      message: `Exported Patient ${patientId} to Excel.`,
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
  return { success: true, message: 'Study log cleared. Next Patient ID: 000010.' };
}
