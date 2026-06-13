import type { AppDesign } from '../types.ts';

const STORAGE_KEY = 'hcq-design';

export function loadDesign(): AppDesign {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dashboard' || stored === 'bedside') return stored;
  } catch {
    /* ignore */
  }
  return 'dashboard';
}

export function saveDesign(design: AppDesign): void {
  try {
    localStorage.setItem(STORAGE_KEY, design);
  } catch {
    /* ignore */
  }
}

export function renderDesignSwitcher(active: AppDesign): string {
  return `
    <nav class="design-tabs" role="tablist" aria-label="App layout">
      <button
        type="button"
        role="tab"
        class="design-tabs__btn ${active === 'dashboard' ? 'is-active' : ''}"
        data-design="dashboard"
        aria-selected="${active === 'dashboard'}"
      >
        Dashboard
      </button>
      <button
        type="button"
        role="tab"
        class="design-tabs__btn ${active === 'bedside' ? 'is-active' : ''}"
        data-design="bedside"
        aria-selected="${active === 'bedside'}"
      >
        Bedside
      </button>
    </nav>
  `;
}
