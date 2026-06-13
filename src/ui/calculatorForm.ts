import type { HeightUnit, IbwAlgorithm, Sex, WeightUnit } from '../types.ts';

export interface FormState {
  sex: Sex;
  heightUnit: HeightUnit;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weightUnit: WeightUnit;
  weight: string;
  dailyDoseMg: string;
  ibwAlgorithm: IbwAlgorithm;
  durationYears: string;
  renalDisease: boolean;
  tamoxifen: boolean;
  ageAtStartOver60: boolean;
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
  ibwAlgorithm: 'nhlbi',
  durationYears: '',
  renalDisease: false,
  tamoxifen: false,
  ageAtStartOver60: false,
};

export function renderCalculatorForm(state: FormState): string {
  return `
    <section class="panel" aria-labelledby="calc-heading">
      <h2 id="calc-heading">Patient &amp; dose</h2>
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
          <span class="field__label">Daily HCQ dose (mg)</span>
          <input type="number" id="daily-dose" name="dailyDoseMg" min="50" max="1200" step="50" value="${state.dailyDoseMg}" list="dose-presets" inputmode="numeric" />
          <datalist id="dose-presets">
            <option value="200"></option>
            <option value="300"></option>
            <option value="400"></option>
            <option value="600"></option>
          </datalist>
        </label>

        <label class="field">
          <span class="field__label">IBW formula</span>
          <select id="ibw-algorithm" name="ibwAlgorithm">
            <option value="nhlbi" ${state.ibwAlgorithm === 'nhlbi' ? 'selected' : ''}>NIH / NHLBI (Michaelides)</option>
            <option value="devine" ${state.ibwAlgorithm === 'devine' ? 'selected' : ''}>Devine</option>
          </select>
        </label>

        <details class="screening-inputs">
          <summary>Screening risk factors (optional)</summary>
          <label class="field">
            <span class="field__label">Years on HCQ</span>
            <input type="number" id="duration-years" name="durationYears" min="0" max="80" step="0.5" value="${state.durationYears}" placeholder="e.g. 3" inputmode="decimal" />
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="renal-disease" name="renalDisease" ${state.renalDisease ? 'checked' : ''} />
            Concurrent renal disease
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="tamoxifen" name="tamoxifen" ${state.tamoxifen ? 'checked' : ''} />
            Concurrent tamoxifen
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="age-start" name="ageAtStartOver60" ${state.ageAtStartOver60 ? 'checked' : ''} />
            HCQ started after age 60
          </label>
        </details>
      </form>
    </section>
  `;
}
