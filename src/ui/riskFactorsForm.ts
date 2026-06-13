import type { FormState } from './calculatorForm.ts';
import type { YesNo } from '../types.ts';

type RiskFactorKey =
  | 'renalDisease'
  | 'tamoxifen'
  | 'macularPathology'
  | 'ageAtStartOver60'
  | 'hcqTwentyYearsOrMore';

const RISK_KEYS: RiskFactorKey[] = [
  'renalDisease',
  'tamoxifen',
  'macularPathology',
  'ageAtStartOver60',
  'hcqTwentyYearsOrMore',
];

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

function summaryStatus(state: FormState): { text: string; hintClass: string } {
  const answered = RISK_KEYS.filter((k) => state[k] === 'yes' || state[k] === 'no').length;
  const yesCount = RISK_KEYS.filter((k) => state[k] === 'yes').length;
  if (answered < RISK_KEYS.length) {
    return { text: `${answered}/${RISK_KEYS.length} answered`, hintClass: 'screening-risks__hint--partial' };
  }
  if (yesCount > 0) {
    return { text: `${yesCount} identified`, hintClass: 'screening-risks__hint--alert' };
  }
  return { text: 'Complete', hintClass: 'screening-risks__hint--complete' };
}

export function renderScreeningRiskFactors(state: FormState): string {
  const { text: hint, hintClass } = summaryStatus(state);

  return `
    <details class="screening-risks" ${state.screeningRisksOpen ? 'open' : ''}>
      <summary class="screening-risks__summary">
        <span class="screening-risks__title">Screening risk factors</span>
        <span class="screening-risks__hint ${hintClass}">${hint}</span>
      </summary>
      <div class="screening-risks__body">
        <p class="screening-risks__intro">Select <strong>Yes</strong> or <strong>No</strong> for each item.</p>
        ${yesNoRow('renalDisease', 'Concurrent renal disease', state.renalDisease)}
        ${yesNoRow('tamoxifen', 'Concurrent tamoxifen', state.tamoxifen)}
        ${yesNoRow('macularPathology', 'Macular pathology', state.macularPathology)}
        ${yesNoRow('ageAtStartOver60', 'HCQ started after age 60', state.ageAtStartOver60)}
        ${yesNoRow('hcqTwentyYearsOrMore', 'On HCQ ≥20 years', state.hcqTwentyYearsOrMore)}
      </div>
    </details>
  `;
}
