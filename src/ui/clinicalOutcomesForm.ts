import type { FormState } from './calculatorForm.ts';
import { RETINAL_TOXICITY_OPTIONS } from '../export/columnSchema.ts';

export function renderClinicalOutcomes(state: FormState): string {
  return `
    <section class="panel decision-panel" aria-labelledby="decision-heading">
      <h2 id="decision-heading">Clinical outcomes</h2>
      <p class="decision-panel__hint">After reviewing the calculated dose, record whether retinal toxicity is present and if a dose adjustment is recommended.</p>
      <div class="decision-panel__fields">
        <label class="field">
          <span class="field__label">Retinal toxicity</span>
          <select id="retinal-toxicity" name="retinalToxicity">
            <option value="" ${state.retinalToxicity === '' ? 'selected' : ''}>— Select —</option>
            ${RETINAL_TOXICITY_OPTIONS.map(
              (level) =>
                `<option value="${level}" ${state.retinalToxicity === level ? 'selected' : ''}>${level}</option>`,
            ).join('')}
          </select>
        </label>
        <fieldset class="risk-yesno">
          <legend class="risk-yesno__legend">Dose adjustment recommended</legend>
          <div class="risk-yesno__options" role="radiogroup" aria-label="Dose adjustment recommended">
            <label class="risk-yesno__label">
              <input type="radio" name="doseAdjustmentRecommended" value="yes" ${state.doseAdjustmentRecommended === 'yes' ? 'checked' : ''} />
              Yes
            </label>
            <label class="risk-yesno__label">
              <input type="radio" name="doseAdjustmentRecommended" value="no" ${state.doseAdjustmentRecommended === 'no' ? 'checked' : ''} />
              No
            </label>
          </div>
        </fieldset>
      </div>
    </section>
  `;
}
