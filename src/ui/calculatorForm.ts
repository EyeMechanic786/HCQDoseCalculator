import { HCQ_DOSE_OPTIONS } from '../export/columnSchema.ts';
import type { HeightUnit, IbwAlgorithm, RetinalToxicityLevel, Sex, WeightUnit, YesNo } from '../types.ts';
import { renderClinicalOutcomes } from './clinicalOutcomesForm.ts';
import { renderScreeningRiskFactors } from './riskFactorsForm.ts';
import { renderResearchExportPanel } from './researchExportPanel.ts';

export interface FormState {
  sex: Sex;
  heightUnit: HeightUnit;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weightUnit: WeightUnit;
  weight: string;
  dailyDoseMg: string;
  hcqDurationYears: string;
  ibwAlgorithm: IbwAlgorithm;
  retinalToxicity: RetinalToxicityLevel;
  doseAdjustmentRecommended: YesNo;
  renalDisease: YesNo;
  tamoxifen: YesNo;
  macularPathology: YesNo;
  ageAtStartOver60: YesNo;
  hcqFiveYearsOrMore: YesNo;
  hcqTwentyYearsOrMore: YesNo;
  screeningRisksOpen: boolean;
}

export const defaultFormState: FormState = {
  sex: 'female',
  heightUnit: 'cm',
  heightCm: '163',
  heightFt: '5',
  heightIn: '4',
  weightUnit: 'kg',
  weight: '73',
  dailyDoseMg: '400',
  hcqDurationYears: '',
  ibwAlgorithm: 'nhlbi',
  retinalToxicity: '',
  doseAdjustmentRecommended: '',
  renalDisease: '',
  tamoxifen: '',
  macularPathology: '',
  ageAtStartOver60: '',
  hcqFiveYearsOrMore: '',
  hcqTwentyYearsOrMore: '',
  screeningRisksOpen: false,
};

export function renderCalculatorForm(state: FormState): string {
  return `
    <section class="panel" aria-labelledby="calc-heading">
      <h2 id="calc-heading">Patient &amp; dose</h2>
      <p class="layout-hint layout-hint--desktop">Dose results appear in the panel to the right once data is entered.</p>
      <p class="layout-hint layout-hint--mobile">
        <a href="#results-root" class="layout-hint__link">Scroll down to Results</a> for the dose comparison table.
      </p>
      <form id="calc-form" class="calc-form" novalidate>
        <fieldset class="field-group">
          <legend>Sex</legend>
          <div class="radio-row">
            <label class="radio-label">
              <input type="radio" name="sex" value="female" ${state.sex === 'female' ? 'checked' : ''} />
              Female
            </label>
            <label class="radio-label">
              <input type="radio" name="sex" value="male" ${state.sex === 'male' ? 'checked' : ''} />
              Male
            </label>
          </div>
        </fieldset>

        <div class="field-row">
          <fieldset class="field-group field-group--grow">
            <legend>Height</legend>
            <div class="unit-toggle" role="group" aria-label="Height unit">
              <button type="button" class="unit-btn ${state.heightUnit === 'cm' ? 'is-active' : ''}" data-height-unit="cm">cm</button>
              <button type="button" class="unit-btn ${state.heightUnit === 'ftin' ? 'is-active' : ''}" data-height-unit="ftin">ft / in</button>
            </div>
            ${
              state.heightUnit === 'cm'
                ? `
              <label class="field">
                <span class="field__label">Centimetres</span>
                <input type="number" id="height-cm" name="heightCm" min="100" max="250" step="0.1" value="${state.heightCm}" inputmode="decimal" />
              </label>`
                : `
              <div class="field-row field-row--inline">
                <label class="field">
                  <span class="field__label">Feet</span>
                  <input type="number" id="height-ft" name="heightFt" min="3" max="8" step="1" value="${state.heightFt}" inputmode="numeric" />
                </label>
                <label class="field">
                  <span class="field__label">Inches</span>
                  <input type="number" id="height-in" name="heightIn" min="0" max="11" step="1" value="${state.heightIn}" inputmode="numeric" />
                </label>
              </div>`
            }
          </fieldset>
        </div>

        <div class="field-row">
          <fieldset class="field-group field-group--grow">
            <legend>Actual body weight</legend>
            <div class="unit-toggle" role="group" aria-label="Weight unit">
              <button type="button" class="unit-btn ${state.weightUnit === 'kg' ? 'is-active' : ''}" data-weight-unit="kg">kg</button>
              <button type="button" class="unit-btn ${state.weightUnit === 'lb' ? 'is-active' : ''}" data-weight-unit="lb">lb</button>
            </div>
            <label class="field">
              <span class="field__label">${state.weightUnit === 'kg' ? 'Kilograms' : 'Pounds'}</span>
              <input type="number" id="weight" name="weight" min="20" max="500" step="0.1" value="${state.weight}" inputmode="decimal" />
            </label>
          </fieldset>
        </div>

        <label class="field">
          <span class="field__label">Duration of HCQ use (years)</span>
          <input type="number" id="hcq-duration" name="hcqDurationYears" min="0" max="100" step="1" value="${state.hcqDurationYears}" inputmode="numeric" placeholder="0–100" />
        </label>

        <label class="field">
          <span class="field__label">Daily HCQ dose (mg)</span>
          <select id="daily-dose" name="dailyDoseMg">
            ${HCQ_DOSE_OPTIONS.map(
              (dose) =>
                `<option value="${dose}" ${state.dailyDoseMg === dose ? 'selected' : ''}>${dose} mg/day</option>`,
            ).join('')}
          </select>
        </label>

        <label class="field">
          <span class="field__label">IBW formula</span>
          <select id="ibw-algorithm" name="ibwAlgorithm">
            <option value="nhlbi" ${state.ibwAlgorithm === 'nhlbi' ? 'selected' : ''}>NIH / NHLBI (Michaelides)</option>
            <option value="devine" ${state.ibwAlgorithm === 'devine' ? 'selected' : ''}>Devine</option>
          </select>
        </label>

        ${renderClinicalOutcomes(state)}

        ${renderScreeningRiskFactors(state)}
      </form>

      ${renderResearchExportPanel()}
    </section>
  `;
}
