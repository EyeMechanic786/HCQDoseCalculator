export function renderDisclaimer(): string {
  return `
    <aside class="disclaimer" role="note" aria-label="Disclaimer and attribution">
      <p class="disclaimer__clinical">
        <strong>For clinician use only.</strong>
        This tool supports clinical judgment for hydroxychloroquine dose assessment and screening planning.
        It does not replace prescribing decisions, rheumatology consultation, or AAO screening protocols.
        Not medical advice. Not FDA cleared. Not a substitute for the judgment of a qualified healthcare professional.
      </p>
      <p class="disclaimer__credit">
        <strong>Original concept credit:</strong>
        The idea of a point-of-care HCQ dose calculator comparing actual and ideal body weight is credited to
        <strong>Dr Elliot Perlman</strong>, who developed
        <a href="https://apps.apple.com/us/app/dosechecker/id1233772258" target="_blank" rel="noopener noreferrer">DoseChecker</a>
        for iOS (Massachusetts Eye and Ear).
        <a href="https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2666807" target="_blank" rel="noopener noreferrer">Perlman et al., <em>JAMA Ophthalmology</em> 2018</a>.
        This web app is an independent project inspired by that work; it is not affiliated with Dr Perlman, Massachusetts Eye and Ear, or Apple.
      </p>
    </aside>
  `;
}
