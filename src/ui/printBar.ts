/** Shared print control — use data-action="print" for event delegation. */
export function renderPrintButton(label = 'Print summary', className = 'btn btn--print'): string {
  return `
    <button type="button" class="${className}" data-action="print">
      ${label}
    </button>
  `;
}

export function renderStickyPrintBar(visible: boolean): string {
  return `
    <div id="print-bar" class="print-bar ${visible ? '' : 'print-bar--hidden'}" ${visible ? '' : 'aria-hidden="true"'}>
      <p class="print-bar__text">Assessment ready — <a href="#results-root" class="print-bar__link">view results</a></p>
      ${renderPrintButton('Print summary', 'print-bar__btn')}
    </div>
  `;
}
