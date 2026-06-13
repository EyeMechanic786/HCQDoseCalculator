import { getLogCount } from '../export/studyLog.ts';
import { loadStudyMeta } from '../export/studyMeta.ts';
import { todayIsoDate } from '../export/buildResearchRow.ts';

export function renderResearchExportPanel(): string {
  const logCount = getLogCount();
  const meta = loadStudyMeta();
  const today = todayIsoDate();

  return `
    <details class="research-export" id="research-export" open>
      <summary class="research-export__summary">
        Research export (Excel)
        <span id="research-log-count" class="research-export__badge ${logCount === 0 ? 'research-export__badge--empty' : ''}" aria-label="${logCount} cases in study log">${logCount}</span>
      </summary>
      <div class="research-export__body">
        <p class="research-export__intro">
          Save anonymised cases for body-weight formula comparison research. Use study subject IDs only — no patient names or NHS numbers.
          Data stays in this browser session until you download Excel.
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
          <label class="research-export__field">
            <span>Subject ID</span>
            <input type="text" id="research-subject-id" placeholder="e.g. 001" autocomplete="off" />
          </label>
          <label class="research-export__field">
            <span>Encounter date</span>
            <input type="date" id="research-encounter-date" value="${today}" />
          </label>
        </div>

        <div class="research-export__actions">
          <button type="button" class="btn btn--secondary" data-action="research-add">
            Add to study log
          </button>
          <button type="button" class="btn btn--secondary" data-action="research-export-current">
            Export current case
          </button>
          <button type="button" class="btn btn--primary" data-action="research-download">
            Download workbook (.xlsx)
          </button>
          <button type="button" class="btn btn--ghost" data-action="research-clear">
            Clear log
          </button>
        </div>

        <p class="research-export__note">
          Enter valid height, weight, and dose above before exporting. Workbook includes AAO, IBW (NIH/NHLBI &amp; Devine), and hybrid columns plus a data dictionary sheet.
        </p>
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
