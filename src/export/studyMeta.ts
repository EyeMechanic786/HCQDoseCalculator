import { STUDY_META_STORAGE_KEY } from './constants.ts';

export interface StudyMeta {
  studyId: string;
  siteId: string;
}

export const defaultStudyMeta: StudyMeta = {
  studyId: '',
  siteId: '',
};

export function loadStudyMeta(): StudyMeta {
  try {
    const raw = sessionStorage.getItem(STUDY_META_STORAGE_KEY);
    if (!raw) return { ...defaultStudyMeta };
    const parsed = JSON.parse(raw) as Partial<StudyMeta>;
    return {
      studyId: parsed.studyId ?? '',
      siteId: parsed.siteId ?? '',
    };
  } catch {
    return { ...defaultStudyMeta };
  }
}

export function saveStudyMeta(meta: StudyMeta): void {
  sessionStorage.setItem(STUDY_META_STORAGE_KEY, JSON.stringify(meta));
}

export function readStudyMetaFromDom(): StudyMeta {
  const studyId = (document.getElementById('research-study-id') as HTMLInputElement)?.value.trim() ?? '';
  const siteId = (document.getElementById('research-site-id') as HTMLInputElement)?.value.trim() ?? '';
  const meta = { studyId, siteId };
  saveStudyMeta(meta);
  return meta;
}
