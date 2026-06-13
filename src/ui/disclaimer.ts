export function renderDisclaimer(): string {
  return `
    <aside class="disclaimer" role="note" aria-label="Disclaimer and attribution">
      <p class="disclaimer__clinical">
        <strong>For clinician use only.</strong>
        This tool is clinical decision support for hydroxychloroquine dose assessment and screening planning.
        It does not replace prescribing decisions, rheumatology consultation, or formal screening and monitoring protocols —
        including current
        <a href="https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h" target="_blank" rel="noopener noreferrer">AAO (US)</a>
        and
        <a href="https://www.rcophth.ac.uk/news-views/hydroxychloroquine-and-chloroquine-retinopathy/" target="_blank" rel="noopener noreferrer">RCOphth (UK)</a>
        guidance for NHS practice.
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
