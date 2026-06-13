import type { FormState } from './calculatorForm.ts';
import type { YesNo } from '../types.ts';

type RiskFactorKey =
  | 'renalDisease'
  | 'tamoxifen'
  | 'macularPathology'
  | 'ageAtStartOver60'
  | 'hcqFiveYearsOrMore';

function yesNoRow(name: RiskFactorKey, label: string, value: YesNo): string {
  return `
    <fieldset class="risk-yesno">
      <legend class="risk-yesno__legend">${label}</legend>
      <div class="risk-yesno__options" role="radiogroup" aria-label="${label}">
        <label class="risk-yesno__label">
          <input type="radio" name="${name}" value="yes" ${value === 'yes' ? 'checked' : ''} />
          Yes
        </label>
        <label class="risk-yesno__label">
          <input type="radio" name="${name}" value="no" ${value === 'no' ? 'checked' : ''} />
          No
        </label>
      </div>
    </fieldset>
  `;
}

export function renderScreeningRiskFactors(state: FormState): string {
  return `
    <section class="screening-risks" aria-labelledby="screening-risks-heading">
      <h3 id="screening-risks-heading" class="screening-risks__heading">Screening risk factors</h3>
      <p class="screening-risks__intro">Select <strong>Yes</strong> or <strong>No</strong> for each item.</p>
      ${yesNoRow('renalDisease', 'Concurrent renal disease', state.renalDisease)}
      ${yesNoRow('tamoxifen', 'Concurrent tamoxifen', state.tamoxifen)}
      ${yesNoRow('macularPathology', 'Macular pathology', state.macularPathology)}
      ${yesNoRow('ageAtStartOver60', 'HCQ started after age 60', state.ageAtStartOver60)}
      ${yesNoRow('hcqFiveYearsOrMore', 'On HCQ ≥5 years', state.hcqFiveYearsOrMore)}
    </section>
  `;
}
