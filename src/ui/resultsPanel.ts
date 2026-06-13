import { renderRiskFactorWarning } from './riskFactorWarning.ts';
import { renderPrintButton } from './printBar.ts';
import { renderResearchExportPanel } from './researchExportPanel.ts';
import { statusClass, statusLabel } from '../calc/screening.ts';
import type { HcqAssessment } from '../types.ts';
import type { ScreeningGuidance } from '../types.ts';
import { formatNumber } from '../calc/units.ts';

export function renderResultsPanel(
  assessment: HcqAssessment | null,
  screening: ScreeningGuidance | null,
  invalidMessage: string | null,
): string {
  if (invalidMessage) {
    return `
      <section class="panel panel--results" aria-live="polite" aria-atomic="true">
        <h2>Results</h2>
        <p class="results-placeholder">${invalidMessage}</p>
      </section>
    `;
  }

  if (!assessment) {
    return `
      <section class="panel panel--results" aria-live="polite" aria-atomic="true">
        <h2>Results</h2>
        <p class="results-placeholder">Enter patient measurements and dose to see assessment.</p>
      </section>
    `;
  }

  const methodRows = assessment.methods
    .map(
      (m) => `
      <tr class="${statusClass(m.status)}">
        <th scope="row">${m.label}</th>
        <td>${m.thresholdLabel}</td>
        <td>${formatNumber(m.mgPerKg, 2)}</td>
        <td>${Math.round(m.maxDailyDoseMg)} mg</td>
        <td><span class="status-badge ${statusClass(m.status)}">${statusLabel(m.status)}</span></td>
      </tr>
    `,
    )
    .join('');

  const screeningBlock = screening
    ? `
    <section class="screening-block" aria-labelledby="screening-heading">
      <h3 id="screening-heading">AAO screening guidance</h3>
      ${
        !screening.riskFactorsComplete
          ? '<p class="screening-flag screening-flag--incomplete">Complete all screening risk factors (Yes/No) to finalise guidance.</p>'
          : screening.elevatedRisk
          ? '<p class="screening-flag screening-flag--elevated">Elevated screening risk — do not defer annual screening.</p>'
          : '<p class="screening-flag screening-flag--routine">No major risk factors — annual screening may be deferred in first 5 years.</p>'
      }
      <ul class="screening-list">
        ${screening.recommendations.map((r) => `<li>${r}</li>`).join('')}
      </ul>
      ${
        screening.riskNotes.length
          ? `<ul class="risk-notes">${screening.riskNotes.map((n) => `<li>${n}</li>`).join('')}</ul>`
          : ''
      }
    </section>
  `
    : '';

  return `
    <section class="panel panel--results" aria-live="polite" aria-atomic="true">
      <div class="results-print-top">
        ${renderPrintButton('Print summary', 'btn btn--print btn--print-top')}
      </div>
      <div class="results-header">
        <h2>Results</h2>
        ${renderPrintButton('Print summary', 'btn btn--secondary')}
      </div>

      <p class="narrative">${assessment.narrative}</p>

      ${renderRiskFactorWarning(screening)}

      ${
        assessment.cap400Message
          ? `<p class="cap-warning" role="alert">${assessment.cap400Message}</p>`
          : ''
      }

      <div class="metrics-grid">
        <div class="metric">
          <span class="metric__label">ABW</span>
          <span class="metric__value">${formatNumber(assessment.abwKg, 1)} kg</span>
        </div>
        <div class="metric">
          <span class="metric__label">IBW (${assessment.ibwAlgorithm === 'nhlbi' ? 'NIH/NHLBI' : 'Devine'})</span>
          <span class="metric__value">${formatNumber(assessment.ibwKg, 1)} kg</span>
        </div>
        <div class="metric">
          <span class="metric__label">Dosing weight min(ABW, IBW)</span>
          <span class="metric__value">${formatNumber(assessment.dosingWeightKg, 1)} kg</span>
        </div>
        <div class="metric">
          <span class="metric__label">BMI</span>
          <span class="metric__value">${formatNumber(assessment.bmi, 1)}</span>
        </div>
      </div>

      <div class="table-wrap">
        <table class="results-table">
          <caption class="visually-hidden">Dosing method comparison</caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Threshold</th>
              <th scope="col">Current mg/kg</th>
              <th scope="col">Max daily dose</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            ${methodRows}
          </tbody>
        </table>
      </div>

      <p class="tablet-note">${assessment.tabletNote}</p>

      ${screeningBlock}

      ${renderResearchExportPanel(true)}

      <details class="references">
        <summary>References &amp; formulae</summary>
        <ul>
          <li><a href="https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h" target="_blank" rel="noopener noreferrer">AAO Recommendations on Screening for HCQ Retinopathy (2026)</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/41232611/" target="_blank" rel="noopener noreferrer">PubMed: AAO 2025 Revision</a></li>
          <li><a href="https://www.rcophth.ac.uk/news-views/hydroxychloroquine-and-chloroquine-retinopathy/" target="_blank" rel="noopener noreferrer">RCOphth — HCQ/Chloroquine retinopathy monitoring (UK, 2020)</a></li>
          <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4116363/" target="_blank" rel="noopener noreferrer">Michaelides et al. — IBW algorithms for HCQ screening</a></li>
        </ul>
        <p class="formula-note">
          NIH/NHLBI fit: IBW (lb) = 4.28 × height (in) − 134.32.
          Devine: 45.5 + 0.91×(cm−152.4) female; 50 + 0.91×(cm−152.4) male.
          AAO threshold: ≤5.0 mg/kg actual weight. IBW literature threshold: ≤6.5 mg/kg IBW.
        </p>
      </details>
    </section>
  `;
}
