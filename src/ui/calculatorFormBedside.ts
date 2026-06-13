import type { FormState } from './calculatorForm.ts';
import { renderScreeningRiskFactors } from './riskFactorsForm.ts';
import { renderResearchExportPanel } from './researchExportPanel.ts';

/** DoseChecker-inspired compact input layout — height, weight, dose first. */
export function renderBedsideForm(state: FormState): string {
  return `
    <section class="bedside-card bedside-card--inputs" aria-labelledby="bedside-inputs-heading">
      <h2 id="bedside-inputs-heading" class="bedside-card__title">Enter patient data</h2>
      <p class="layout-hint layout-hint--mobile">
        <a href="#results-root" class="layout-hint__link">Scroll down to Results</a> for the dose assessment.
      </p>
      <form id="calc-form" class="bedside-form" novalidate>
        <div class="bedside-segment" role="group" aria-label="Sex">
          <button type="button" class="bedside-segment__btn ${state.sex === 'female' ? 'is-active' : ''}" data-sex="female">Female</button>
          <button type="button" class="bedside-segment__btn ${state.sex === 'male' ? 'is-active' : ''}" data-sex="male">Male</button>
          <input type="hidden" name="sex" id="bedside-sex" value="${state.sex}" />
        </div>

        <div class="bedside-field-grid">
          <label class="bedside-field">
            <span class="bedside-field__label">Height</span>
            <div class="bedside-field__row">
              ${
                state.heightUnit === 'ftin'
                  ? `
                <input type="number" id="height-ft" class="bedside-input bedside-input--short" min="3" max="8" step="1" value="${state.heightFt}" aria-label="Feet" />
                <span class="bedside-unit">ft</span>
                <input type="number" id="height-in" class="bedside-input bedside-input--short" min="0" max="11" step="1" value="${state.heightIn}" aria-label="Inches" />
                <span class="bedside-unit">in</span>`
                  : `
                <input type="number" id="height-cm" class="bedside-input" min="100" max="250" step="0.1" value="${state.heightCm}" aria-label="Centimetres" />
                <span class="bedside-unit">cm</span>`
              }
              <button type="button" class="bedside-unit-toggle" data-height-unit="${state.heightUnit === 'cm' ? 'ftin' : 'cm'}">
                ${state.heightUnit === 'cm' ? 'Use ft/in' : 'Use cm'}
              </button>
            </div>
          </label>

          <label class="bedside-field">
            <span class="bedside-field__label">Weight</span>
            <div class="bedside-field__row">
              <input type="number" id="weight" class="bedside-input" min="20" max="500" step="0.1" value="${state.weight}" aria-label="Weight" />
              <span class="bedside-unit">${state.weightUnit}</span>
              <button type="button" class="bedside-unit-toggle" data-weight-unit="${state.weightUnit === 'kg' ? 'lb' : 'kg'}">
                ${state.weightUnit === 'kg' ? 'Use lb' : 'Use kg'}
              </button>
            </div>
          </label>

          <label class="bedside-field bedside-field--dose">
            <span class="bedside-field__label">Current daily dose</span>
            <div class="bedside-field__row">
              <input type="number" id="daily-dose" class="bedside-input bedside-input--dose" min="50" max="1200" step="50" value="${state.dailyDoseMg}" aria-label="Daily dose in milligrams" />
              <span class="bedside-unit">mg/day</span>
            </div>
          </label>
        </div>

        ${renderScreeningRiskFactors(state)}

        <details class="bedside-advanced">
          <summary>IBW formula</summary>
          <label class="bedside-field">
            <select id="ibw-algorithm" class="bedside-select">
              <option value="nhlbi" ${state.ibwAlgorithm === 'nhlbi' ? 'selected' : ''}>NIH / NHLBI</option>
              <option value="devine" ${state.ibwAlgorithm === 'devine' ? 'selected' : ''}>Devine</option>
            </select>
          </label>
        </details>
      </form>

      ${renderResearchExportPanel()}
    </section>
  `;
}
