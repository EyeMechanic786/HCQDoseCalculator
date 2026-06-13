import { getSuggestedPatientId, loadDraftPatientId } from '../export/patientId.ts';
import { getLogCount, getSavedPatientIds } from '../export/studyLog.ts';
import { loadStudyMeta } from '../export/studyMeta.ts';
import { todayIsoDate } from '../export/buildResearchRow.ts';

export function renderResearchExportPanel(): string {
  const logCount = getLogCount();
  const meta = loadStudyMeta();
  const today = todayIsoDate();
  const suggestedId = getSuggestedPatientId();
  const draftId = loadDraftPatientId();
  const displayId = draftId || suggestedId;
  const savedIds = getSavedPatientIds();
  const savedIdsText =
    savedIds.length > 0 ? `Saved this session: ${savedIds.join(', ')}` : 'No patients saved yet this session.';

  return `
    <details class="research-export" id="research-export" open>
      <summary class="research-export__summary">
        Research study
        <span id="research-log-count" class="research-export__badge ${logCount === 0 ? 'research-export__badge--empty' : ''}" aria-label="${logCount} cases in study log">${logCount}</span>
      </summary>
      <div class="research-export__body">
        <nav class="research-tabs" role="tablist" aria-label="Research study sections">
          <button type="button" class="research-tabs__tab is-active" role="tab" id="research-tab-patient-id" data-research-tab="patient-id" aria-selected="true" aria-controls="research-panel-patient-id">
            Patient ID
          </button>
          <button type="button" class="research-tabs__tab" role="tab" id="research-tab-study" data-research-tab="study" aria-selected="false" aria-controls="research-panel-study">
            Study setup
          </button>
          <button type="button" class="research-tabs__tab" role="tab" id="research-tab-export" data-research-tab="export" aria-selected="false" aria-controls="research-panel-export">
            Export
          </button>
        </nav>

        <div id="research-panel-patient-id" class="research-tab-panel is-active" role="tabpanel" aria-labelledby="research-tab-patient-id" data-research-panel="patient-id">
          <div class="patient-id-card">
            <p class="patient-id-card__eyebrow">Required · anonymous · unique per patient</p>
            <label class="patient-id-card__label" for="research-patient-id">Patient ID</label>
            <input
              type="text"
              id="research-patient-id"
              class="patient-id-card__input"
              value="${escapeAttr(displayId)}"
              placeholder="e.g. 000010"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              maxlength="20"
              aria-describedby="research-patient-id-help research-patient-id-error"
              required
            />
            <p id="research-patient-id-error" class="patient-id-card__error" role="alert" hidden></p>
            <p id="research-patient-id-help" class="patient-id-card__note">
              Enter a <strong>unique ID for each patient</strong> before saving (not a name or NHS number).
              Suggested next ID: <strong>${escapeAttr(suggestedId)}</strong> — change if your study uses a different scheme.
            </p>
            <p id="research-saved-ids" class="patient-id-card__saved" aria-live="polite">${escapeHtml(savedIdsText)}</p>
          </div>
          <label class="research-export__field research-export__field--date">
            <span>Encounter date</span>
            <input type="date" id="research-encounter-date" value="${today}" />
          </label>
        </div>

        <div id="research-panel-study" class="research-tab-panel" role="tabpanel" aria-labelledby="research-tab-study" data-research-panel="study" hidden>
          <p class="research-export__intro">
            Optional protocol identifiers for multi-site studies. Leave blank for single-centre use.
          </p>
          <div class="research-export__fields">
            <label class="research-export__field">
              <span>Study ID</span>
              <input type="text" id="research-study-id" value="${escapeAttr(meta.studyId)}" placeholder="e.g. PROTO-2026-HCQ" autocomplete="off" />
            </label>
            <label class="research-export__field">
              <span>Site ID</span>
              <input type="text" id="research-site-id" value="${escapeAttr(meta.siteId)}" placeholder="e.g. Site-A" autocomplete="off" />
            </label>
          </div>
        </div>

        <div id="research-panel-export" class="research-tab-panel" role="tabpanel" aria-labelledby="research-tab-export" data-research-panel="export" hidden>
          <p class="research-export__intro">
            Save each patient with a unique Patient ID, then download the full session workbook.
            Data remains in this browser until exported.
          </p>
          <div class="research-export__actions">
            <button type="button" class="btn btn--secondary" data-action="research-add">
              Save patient to log
            </button>
            <button type="button" class="btn btn--secondary" data-action="research-export-current">
              Export current patient
            </button>
            <button type="button" class="btn btn--primary" data-action="research-download">
              Download workbook (.xlsx)
            </button>
            <button type="button" class="btn btn--ghost" data-action="research-clear">
              Clear log
            </button>
          </div>
          <p class="research-export__note">
            Each save requires a unique Patient ID on the Patient ID tab. The workbook includes all saved cases with AAO, IBW, and hybrid columns plus a data dictionary.
          </p>
        </div>
      </div>
    </details>
  `;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escapeHtml(value: string): string {
  return escapeAttr(value);
}

export function switchResearchTab(tabId: string): void {
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
