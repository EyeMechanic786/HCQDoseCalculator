import { assessHcqDose, isValidInput } from './calc/hcqDose.ts';
import { getScreeningGuidance } from './calc/screening.ts';
import { ftInToCm, lbToKg } from './calc/units.ts';
import { printSummary } from './print.ts';
import type { HcqAssessment, PatientInput, ScreeningRiskFactors } from './types.ts';
import {
  defaultFormState,
  renderCalculatorForm,
  type FormState,
} from './ui/calculatorForm.ts';
import { renderDisclaimer } from './ui/disclaimer.ts';
import { renderResultsPanel } from './ui/resultsPanel.ts';
import './style.css';

let formState: FormState = { ...defaultFormState };
let lastAssessment: HcqAssessment | null = null;
let lastScreening = getScreeningGuidance(null, parseRiskFactors(formState));

function parseRiskFactors(state: FormState): ScreeningRiskFactors {
  const duration = state.durationYears.trim();
  return {
    durationYears: duration === '' ? null : Number(duration),
    renalDisease: state.renalDisease,
    tamoxifen: state.tamoxifen,
    ageAtStartOver60: state.ageAtStartOver60,
  };
}

function parsePatientInput(state: FormState): Partial<PatientInput> | null {
  const heightCm =
    state.heightUnit === 'cm'
      ? Number(state.heightCm)
      : ftInToCm(Number(state.heightFt), Number(state.heightIn));

  const weightKg =
    state.weightUnit === 'kg' ? Number(state.weight) : lbToKg(Number(state.weight));

  return {
    sex: state.sex,
    heightCm,
    weightKg,
    dailyDoseMg: Number(state.dailyDoseMg),
  };
}

function validateInput(input: Partial<PatientInput>): string | null {
  if (!input.heightCm || input.heightCm <= 0) return 'Enter a valid height.';
  if (!input.weightKg || input.weightKg <= 0) return 'Enter a valid weight.';
  if (!input.dailyDoseMg || input.dailyDoseMg <= 0) return 'Enter a valid daily dose.';
  return null;
}

function compute(): void {
  const partial = parsePatientInput(formState);
  if (!partial) return;

  const invalidMessage = validateInput(partial);
  const resultsEl = document.getElementById('results-root');
  if (!resultsEl) return;

  if (invalidMessage) {
    lastAssessment = null;
    lastScreening = getScreeningGuidance(null, parseRiskFactors(formState));
    resultsEl.innerHTML = renderResultsPanel(null, lastScreening, invalidMessage);
    return;
  }

  if (!isValidInput(partial)) return;

  lastAssessment = assessHcqDose(partial, formState.ibwAlgorithm);
  lastScreening = getScreeningGuidance(lastAssessment, parseRiskFactors(formState));
  resultsEl.innerHTML = renderResultsPanel(lastAssessment, lastScreening, null);
  bindPrintButton();
}

function bindPrintButton(): void {
  document.getElementById('print-btn')?.addEventListener('click', () => {
    if (lastAssessment) printSummary(lastAssessment, lastScreening);
  });
}

function readFormFromDom(): void {
  const form = document.getElementById('calc-form');
  if (!form) return;

  const sex = (form.querySelector('input[name="sex"]:checked') as HTMLInputElement)?.value as
    | 'female'
    | 'male';
  if (sex) formState.sex = sex;

  formState.heightCm =
    (document.getElementById('height-cm') as HTMLInputElement)?.value ?? formState.heightCm;
  formState.heightFt =
    (document.getElementById('height-ft') as HTMLInputElement)?.value ?? formState.heightFt;
  formState.heightIn =
    (document.getElementById('height-in') as HTMLInputElement)?.value ?? formState.heightIn;
  formState.weight = (document.getElementById('weight') as HTMLInputElement)?.value ?? formState.weight;
  formState.dailyDoseMg =
    (document.getElementById('daily-dose') as HTMLInputElement)?.value ?? formState.dailyDoseMg;
  formState.ibwAlgorithm = (
    (document.getElementById('ibw-algorithm') as HTMLSelectElement)?.value ?? 'nhlbi'
  ) as FormState['ibwAlgorithm'];
  formState.durationYears =
    (document.getElementById('duration-years') as HTMLInputElement)?.value ?? '';
  formState.renalDisease = (document.getElementById('renal-disease') as HTMLInputElement)?.checked ?? false;
  formState.tamoxifen = (document.getElementById('tamoxifen') as HTMLInputElement)?.checked ?? false;
  formState.ageAtStartOver60 =
    (document.getElementById('age-start') as HTMLInputElement)?.checked ?? false;
}

function renderApp(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        <h1>HCQ Dose Calculator</h1>
        <p class="tagline">Hydroxychloroquine dosing &amp; screening guidance for eye care professionals</p>
      </div>
    </header>
    ${renderDisclaimer()}
    <main id="main" class="main">
      <div class="layout">
        <div id="form-root">${renderCalculatorForm(formState)}</div>
        <div id="results-root">${renderResultsPanel(null, lastScreening, null)}</div>
      </div>
    </main>
    <footer class="site-footer">
      <p>Formula version: AAO 2026 · NIH/NHLBI IBW · v1.0</p>
    </footer>
  `;

  bindFormEvents();
  compute();
}

function bindFormEvents(): void {
  const formRoot = document.getElementById('form-root');
  if (!formRoot) return;

  formRoot.addEventListener('input', () => {
    readFormFromDom();
    compute();
  });

  formRoot.addEventListener('change', () => {
    readFormFromDom();
    compute();
  });

  formRoot.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const heightUnit = target.dataset.heightUnit as FormState['heightUnit'] | undefined;
    const weightUnit = target.dataset.weightUnit as FormState['weightUnit'] | undefined;

    if (heightUnit) {
      formState.heightUnit = heightUnit;
      renderApp();
      return;
    }
    if (weightUnit) {
      formState.weightUnit = weightUnit;
      renderApp();
    }
  });
}

renderApp();
