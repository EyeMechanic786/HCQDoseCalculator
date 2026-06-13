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
  <div class="disclaimer"><strong>Clinician use only.</strong> Decision support — not medical advice.</div>
  <p><strong>Daily dose:</strong> ${assessment.dailyDoseMg} mg</p>
  <p><strong>ABW:</strong> ${assessment.abwKg} kg | <strong>IBW:</strong> ${assessment.ibwKg} kg | <strong>BMI:</strong> ${assessment.bmi}</p>
  <p>${assessment.narrative}</p>
  <table>
    <thead><tr><th>Method</th><th>mg/kg</th><th>Max mg/day</th><th>Status</th></tr></thead>
    <tbody>${methods}</tbody>
  </table>
  <h2>Screening guidance</h2>
  <ul>${screening.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
  ${screening.riskNotes.length ? `<h3>Risk notes</h3><ul>${screening.riskNotes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}
  <p style="font-size:0.8rem;margin-top:2rem;">Formula version: AAO 2026 · NIH/NHLBI IBW · v1.0</p>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}
