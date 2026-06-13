import type { ScreeningGuidance } from '../types.ts';

export function renderRiskFactorWarning(screening: ScreeningGuidance | null): string {
  if (!screening) return '';

  if (!screening.riskFactorsComplete) {
    return `
      <div class="risk-factor-alert risk-factor-alert--incomplete" role="alert">
        <strong>Screening risk factors incomplete.</strong>
        Select Yes or No for every item above to complete the risk assessment.
      </div>
    `;
  }

  if (!screening.showRiskFactorWarning) return '';

  const items = screening.identifiedRiskFactors
    .map((r) => `<li>${r.label}</li>`)
    .join('');

  return `
    <div class="risk-factor-alert risk-factor-alert--identified" role="alert">
      <strong>Higher-risk patient — screening risk factors identified</strong>
      <p>${screening.riskFactorWarningMessage}</p>
      <ul class="risk-factor-alert__list">${items}</ul>
    </div>
  `;
}
