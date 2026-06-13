let noticeTimer: number | null = null;

export function showPrintNotice(message: string, isError = false): void {
  let el = document.getElementById('print-notice');
  if (!el) {
    el = document.createElement('div');
    el.id = 'print-notice';
    el.className = 'print-notice';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle('print-notice--error', isError);
  el.classList.add('print-notice--visible');

  if (noticeTimer !== null) window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    el?.classList.remove('print-notice--visible');
  }, 6000);
}
