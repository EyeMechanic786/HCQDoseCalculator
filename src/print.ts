import type { HcqAssessment, ScreeningGuidance } from './types.ts';

export function printSummary(assessment: HcqAssessment, screening: ScreeningGuidance): void {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!win) return;

  const methods = assessment.methods
    .map(
      (m) =>
        `<tr><td>${m.label}</td><td>${m.mgPerKg} mg/kg</td><td>${Math.round(m.maxDailyDoseMg)} mg</td><td>${m.status}</td></tr>`,
    )
    .join('');

  const riskFactorBlock = !screening.riskFactorsComplete
    ? `<div class="disclaimer"><strong>Screening risk factors incomplete.</strong> Yes/No required for each item.</div>`
    : screening.showRiskFactorWarning
      ? `<div class="disclaimer" style="border-color:#991b1b;background:#fee2e2;">
          <strong>Higher-risk patient — screening risk factors identified</strong>
          <p>${screening.riskFactorWarningMessage}</p>
          <ul>${screening.identifiedRiskFactors.map((r) => `<li>${r.label}</li>`).join('')}</ul>
        </div>`
      : '';

  win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HCQ Dose Assessment Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; color: #111; line-height: 1.5; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    .disclaimer { font-size: 0.85rem; border: 1px solid #666; padding: 0.75rem; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #333; padding: 0.4rem 0.6rem; text-align: left; }
    th { background: #eee; }
    ul { padding-left: 1.25rem; }
    @media print { body { margin: 0.5in; } }
  </style>
</head>
<body>
  <h1>HCQ Dose Assessment Summary</h1>
  <p>Generated ${new Date().toLocaleString()}</p>
  <div class="disclaimer">
    <p><strong>For clinician use only.</strong> Decision support — not medical advice. Not FDA cleared.
    Does not replace prescribing decisions or AAO screening protocols.</p>
    <p><strong>Original concept credit:</strong> Dr Elliot Perlman — DoseChecker (iOS, Massachusetts Eye and Ear).
    Perlman et al., JAMA Ophthalmology 2018. This summary is from an independent web tool inspired by that work.</p>
  </div>
  <p><strong>Daily dose:</strong> ${assessment.dailyDoseMg} mg</p>
  <p><strong>ABW:</strong> ${assessment.abwKg} kg | <strong>IBW:</strong> ${assessment.ibwKg} kg | <strong>BMI:</strong> ${assessment.bmi}</p>
  <p>${assessment.narrative}</p>
  ${riskFactorBlock}
  <table>
    <thead><tr><th>Method</th><th>mg/kg</th><th>Max mg/day</th><th>Status</th></tr></thead>
    <tbody>${methods}</tbody>
  </table>
  <h2>Screening guidance</h2>
  <ul>${screening.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
  ${screening.riskNotes.length ? `<h3>Risk notes</h3><ul>${screening.riskNotes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}
  <p style="font-size:0.8rem;margin-top:2rem;">Formula version: AAO 2026 · NIH/NHLBI IBW · v1.1</p>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}
