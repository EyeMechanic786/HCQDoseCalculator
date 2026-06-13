import type { HcqAssessment, ScreeningGuidance } from './types.ts';

export interface PrintResult {
  success: boolean;
  message: string;
}

export function buildPrintHtml(assessment: HcqAssessment, screening: ScreeningGuidance): string {
  const methods = assessment.methods
    .map(
      (m) =>
        `<tr><td>${m.label}</td><td>${m.mgPerKg} mg/kg</td><td>${Math.round(m.maxDailyDoseMg)} mg</td><td>${m.status}</td></tr>`,
    )
    .join('');

  const riskFactorBlock = !screening.riskFactorsComplete
    ? `<div class="alert alert--caution"><strong>Screening risk factors incomplete.</strong> Yes/No required for each item.</div>`
    : screening.showRiskFactorWarning
      ? `<div class="alert alert--danger">
          <strong>Higher-risk patient — screening risk factors identified</strong>
          <p>${screening.riskFactorWarningMessage}</p>
          <ul>${screening.identifiedRiskFactors.map((r) => `<li>${r.label}</li>`).join('')}</ul>
        </div>`
      : `<div class="alert alert--ok"><strong>Screening risk factors:</strong> None identified (all answered No).</div>`;

  const doseWarning = assessment.methods.some((m) => m.status === 'exceeds')
    ? '<div class="alert alert--danger"><strong>Dose warning:</strong> Current dose exceeds one or more safe dosing thresholds.</div>'
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HCQ Dose Assessment Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; color: #111; line-height: 1.5; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    .disclaimer { font-size: 0.85rem; border: 1px solid #666; padding: 0.75rem; margin: 1rem 0; }
    .alert { padding: 0.75rem; margin: 1rem 0; border: 2px solid #666; }
    .alert--danger { border-color: #991b1b; background: #fee2e2; }
    .alert--caution { border-color: #92400e; background: #fef3c7; }
    .alert--ok { border-color: #14532d; background: #dcfce7; }
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
    <p><strong>For clinician use only.</strong> Clinical decision support — not medical advice. Not FDA cleared.
    Does not replace prescribing decisions, rheumatology consultation, or formal AAO (US) or RCOphth (UK) screening and monitoring protocols for NHS practice.</p>
    <p><strong>Original concept credit:</strong> Dr Elliot Perlman — DoseChecker (iOS, Massachusetts Eye and Ear).
    Perlman et al., JAMA Ophthalmology 2018.</p>
  </div>
  <p><strong>Daily dose:</strong> ${assessment.dailyDoseMg} mg</p>
  <p><strong>ABW:</strong> ${assessment.abwKg} kg | <strong>IBW:</strong> ${assessment.ibwKg} kg | <strong>BMI:</strong> ${assessment.bmi}</p>
  <p>${assessment.narrative}</p>
  ${doseWarning}
  ${riskFactorBlock}
  <table>
    <thead><tr><th>Method</th><th>mg/kg</th><th>Max mg/day</th><th>Status</th></tr></thead>
    <tbody>${methods}</tbody>
  </table>
  <h2>Screening guidance</h2>
  <ul>${screening.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
  ${screening.riskNotes.length ? `<h3>Risk notes</h3><ul>${screening.riskNotes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}
  <p style="font-size:0.8rem;margin-top:2rem;">Formula version: AAO 2026 · NIH/NHLBI IBW · v1.1</p>
</body>
</html>`;
}

function printViaPopup(html: string): boolean {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  win.print();
  return true;
}

function printViaIframe(html: string): boolean {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const frameWin = iframe.contentWindow;
  const doc = frameWin?.document;
  if (!doc || !frameWin) {
    iframe.remove();
    return false;
  }
  doc.open();
  doc.write(html);
  doc.close();
  frameWin.focus();
  frameWin.print();
  window.setTimeout(() => iframe.remove(), 2000);
  return true;
}

export function printSummary(assessment: HcqAssessment, screening: ScreeningGuidance): PrintResult {
  const html = buildPrintHtml(assessment, screening);

  if (printViaPopup(html)) {
    return { success: true, message: 'Print dialog opened in a new window.' };
  }

  if (printViaIframe(html)) {
    return {
      success: true,
      message: 'Print dialog opened. If you do not see it, check your browser print settings.',
    };
  }

  return {
    success: false,
    message:
      'Could not open the print dialog. Allow pop-ups for this site, or use your browser menu: Print (Ctrl+P) after taking a screenshot of the results.',
  };
}
