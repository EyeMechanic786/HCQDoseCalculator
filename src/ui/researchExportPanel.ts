import { getCurrentPatientId } from '../export/patientId.ts';
import { getLogCount } from '../export/studyLog.ts';
import { loadStudyMeta } from '../export/studyMeta.ts';
import { todayIsoDate } from '../export/buildResearchRow.ts';

export function renderResearchExportPanel(): string {
  const logCount = getLogCount();
  const meta = loadStudyMeta();
  const today = todayIsoDate();
  const patientId = getCurrentPatientId();

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
            <p class="patient-id-card__eyebrow">Anonymous identifier · sequential</p>
            <p class="patient-id-card__label">Current Patient ID</p>
            <p id="research-patient-id" class="patient-id-card__value" aria-live="polite">${patientId}</p>
            <p class="patient-id-card__note">
              Assigned automatically when you save or export. Not linked to name, NHS number, or date of birth.
              First ID in each session is <strong>000010</strong>, then 000011, 000012…
            </p>
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
            Save cases to a session log, then download a formatted Excel workbook for analysis.
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
            Enter valid height, weight, and dose above before saving. Workbook includes AAO, IBW (NIH/NHLBI &amp; Devine), hybrid columns, and a data dictionary.
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
