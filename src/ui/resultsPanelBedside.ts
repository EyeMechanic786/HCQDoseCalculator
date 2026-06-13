import { renderRiskFactorWarning } from './riskFactorWarning.ts';
import { renderPrintButton } from './printBar.ts';
import { renderResearchExportPanel } from './researchExportPanel.ts';
import { statusClass, statusLabel } from '../calc/screening.ts';
import { formatNumber, kgToLb } from '../calc/units.ts';
import type { HcqAssessment, ScreeningGuidance } from '../types.ts';

/** DoseChecker-inspired results: governing weekly dose, ABW vs IBW columns, regimen card. */
export function renderBedsideResults(
  assessment: HcqAssessment | null,
  screening: ScreeningGuidance | null,
  invalidMessage: string | null,
): string {
  if (invalidMessage || !assessment) {
    return `
      <section class="bedside-card bedside-card--results" aria-live="polite" aria-atomic="true">
        <p class="bedside-placeholder">${invalidMessage ?? 'Enter height, weight, and dose to calculate.'}</p>
      </section>
    `;
  }

  const { weeklyRegimen: w } = assessment;
  const heroClass = w.currentExceedsSafe ? 'bedside-hero--alert' : 'bedside-hero--safe';
  const heroTitle = w.currentExceedsSafe ? 'Current dose exceeds safe limit' : 'Current dose within safe range';
  const ibwLabel = assessment.ibwAlgorithm === 'nhlbi' ? 'NIH/NHLBI' : 'Devine';

  const screeningHtml = screening
    ? `
    <details class="bedside-screening">
      <summary>Screening reminders (AAO)</summary>
      <p class="bedside-screening__flag ${
        !screening.riskFactorsComplete
          ? 'is-incomplete'
          : screening.elevatedRisk
            ? 'is-elevated'
            : 'is-routine'
      }">
        ${
          !screening.riskFactorsComplete
            ? 'Complete all screening risk factors (Yes/No).'
            : screening.elevatedRisk
              ? 'Elevated risk — annual screening advised.'
              : 'Routine screening schedule may apply.'
        }
      </p>
      <ul>${screening.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
    </details>
  `
    : '';

  return `
    <section class="bedside-results" aria-live="polite" aria-atomic="true">
      <div class="bedside-print-top">
        ${renderPrintButton('Print summary', 'bedside-btn bedside-btn--print-top')}
      </div>
      <div class="bedside-hero ${heroClass}">
        <p class="bedside-hero__eyebrow">Recommendation · DoseChecker-style</p>
        <h2 class="bedside-hero__title">${heroTitle}</h2>
        <p class="bedside-hero__dose">
          <span class="bedside-hero__number">${w.governingWeeklyMg}</span>
          <span class="bedside-hero__unit">mg/week max</span>
        </p>
        <p class="bedside-hero__detail">
          Based on <strong>${w.governingMethodLabel}</strong>
          (≈ ${w.maxDailyEquivalentMg} mg/day average)
        </p>
        <p class="bedside-hero__current">
          Patient now: <strong>${assessment.dailyDoseMg} mg/day</strong>
          (${w.currentWeeklyMg} mg/week)
        </p>
      </div>

      ${renderRiskFactorWarning(screening)}

      <div class="bedside-compare">
        <article class="bedside-compare__col ${w.governingMethod === 'abw' ? 'is-governing' : ''}">
          <h3>Actual body weight</h3>
          <p class="bedside-compare__weight">${formatNumber(assessment.abwKg, 1)} kg · ${formatNumber(kgToLb(assessment.abwKg), 0)} lb</p>
          <dl class="bedside-stat-list">
            <div><dt>Max daily</dt><dd>${Math.round(assessment.methods[0]!.maxDailyDoseMg)} mg</dd></div>
            <div><dt>Max weekly</dt><dd>${w.maxWeeklyAbwMg} mg</dd></div>
            <div><dt>Current mg/kg</dt><dd>${formatNumber(assessment.mgPerKgAbw, 1)}</dd></div>
            <div><dt>Status</dt><dd><span class="status-badge ${statusClass(assessment.methods[0]!.status)}">${statusLabel(assessment.methods[0]!.status)}</span></dd></div>
          </dl>
        </article>

        <article class="bedside-compare__col ${w.governingMethod === 'ibw' ? 'is-governing' : ''}">
          <h3>Ideal body weight</h3>
          <p class="bedside-compare__weight">${formatNumber(assessment.ibwKg, 1)} kg · ${ibwLabel}</p>
          <dl class="bedside-stat-list">
            <div><dt>Max daily</dt><dd>${Math.round(assessment.methods[1]!.maxDailyDoseMg)} mg</dd></div>
            <div><dt>Max weekly</dt><dd>${w.maxWeeklyIbwMg} mg</dd></div>
            <div><dt>Current mg/kg</dt><dd>${formatNumber(assessment.mgPerKgIbw, 1)}</dd></div>
            <div><dt>Status</dt><dd><span class="status-badge ${statusClass(assessment.methods[1]!.status)}">${statusLabel(assessment.methods[1]!.status)}</span></dd></div>
          </dl>
        </article>
      </div>

      <article class="bedside-card bedside-card--regimen">
        <h3 class="bedside-card__title">Suggested weekly regimen</h3>
        <p class="bedside-regimen__summary">${w.scheduleSummary}</p>
        <p class="bedside-regimen__note">
          Uses 200 mg and 400 mg tablet steps, matching the approach in Perlman et al. DoseChecker (JAMA Ophthalmology 2018).
          Discuss any change with the prescribing physician.
        </p>
        ${
          assessment.cap400Message
            ? `<p class="bedside-regimen__warning">${assessment.cap400Message}</p>`
            : ''
        }
      </article>

      <div class="bedside-actions">
        ${renderPrintButton('Print for clinic record', 'bedside-btn')}
      </div>

      ${screeningHtml}

      ${renderResearchExportPanel(true)}

      <p class="bedside-footnote">
        Lesser-of-weight hybrid max: ${Math.round(assessment.methods[2]!.maxDailyDoseMg)} mg/day · BMI ${formatNumber(assessment.bmi, 1)}
      </p>
    </section>
  `;
}
