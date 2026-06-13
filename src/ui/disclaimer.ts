export function renderDisclaimer(): string {
  return `
    <aside class="disclaimer" role="note" aria-label="Clinical disclaimer">
      <strong>For clinician use only.</strong>
      This tool supports clinical judgment for hydroxychloroquine dose assessment and screening planning.
      It does not replace prescribing decisions, rheumatology consultation, or AAO screening protocols.
      Not medical advice. Not FDA cleared.
    </aside>
  `;
}
