import { assessHcqDose, isValidInput } from './calc/hcqDose.ts';
import { getScreeningGuidance } from './calc/screening.ts';
import { ftInToCm, lbToKg } from './calc/units.ts';
import { printSummary } from './print.ts';
import {
  handleAddToStudyLog,
  handleClearStudyLog,
  handleDownloadWorkbook,
  handleExportCurrentCase,
} from './export/researchActions.ts';
import { renderStickyPrintBar } from './ui/printBar.ts';
import { showPrintNotice } from './ui/printNotice.ts';
import type { AppDesign, HcqAssessment, PatientInput, ScreeningRiskFactors } from './types.ts';
import { renderBedsideForm } from './ui/calculatorFormBedside.ts';
import {
  defaultFormState,
  renderCalculatorForm,
  type FormState,
} from './ui/calculatorForm.ts';
import { loadDesign, renderDesignSwitcher, saveDesign } from './ui/design.ts';
import { renderDisclaimer } from './ui/disclaimer.ts';
import { renderBedsideResults } from './ui/resultsPanelBedside.ts';
import { renderResultsPanel } from './ui/resultsPanel.ts';
import './style.css';
import './style-bedside.css';

const appRoot = document.getElementById('app');
if (!appRoot) throw new Error('App root element not found');
const app = appRoot;

let formState: FormState = { ...defaultFormState };
let appDesign: AppDesign = loadDesign();
let lastAssessment: HcqAssessment | null = null;
let lastScreening = getScreeningGuidance(null, parseRiskFactors(formState));

function parseRiskFactors(state: FormState): ScreeningRiskFactors {
  return {
    renalDisease: state.renalDisease,
    tamoxifen: state.tamoxifen,
    macularPathology: state.macularPathology,
    ageAtStartOver60: state.ageAtStartOver60,
    hcqFiveYearsOrMore: state.hcqFiveYearsOrMore,
  };
}

function readYesNo(name: string): FormState['renalDisease'] {
  const selected = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
  const value = selected?.value;
  if (value === 'yes' || value === 'no') return value;
  return '';
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

function applyDesignClass(): void {
  document.body.classList.remove('design-dashboard', 'design-bedside');
  document.body.classList.add(appDesign === 'bedside' ? 'design-bedside' : 'design-dashboard');
}

function compute(): void {
  const partial = parsePatientInput(formState);
  if (!partial) return;

  const invalidMessage = validateInput(partial);
  const resultsEl = document.getElementById('results-root');
  if (!resultsEl) return;

  const renderResults =
    appDesign === 'bedside' ? renderBedsideResults : renderResultsPanel;

  if (invalidMessage) {
    lastAssessment = null;
    lastScreening = getScreeningGuidance(null, parseRiskFactors(formState));
    resultsEl.innerHTML = renderResults(null, lastScreening, invalidMessage);
    updatePrintBar(false);
    return;
  }

  if (!isValidInput(partial)) return;

  lastAssessment = assessHcqDose(partial, formState.ibwAlgorithm);
  lastScreening = getScreeningGuidance(lastAssessment, parseRiskFactors(formState));
  resultsEl.innerHTML = renderResults(lastAssessment, lastScreening, null);
  updatePrintBar(true);
}

function updatePrintBar(visible: boolean): void {
  const bar = document.getElementById('print-bar');
  if (!bar) return;
  bar.classList.toggle('print-bar--hidden', !visible);
  bar.setAttribute('aria-hidden', String(!visible));
}

function getValidPatientInput(): PatientInput | null {
  const partial = parsePatientInput(formState);
  if (!partial || validateInput(partial) || !isValidInput(partial)) return null;
  return partial;
}

function handlePrint(): void {
  if (!lastAssessment) {
    showPrintNotice('Enter patient data to generate a printable summary.', true);
    return;
  }
  const result = printSummary(lastAssessment, lastScreening);
  showPrintNotice(result.message, !result.success);
}

async function handleResearchAction(action: string): Promise<void> {
  readFormFromDom();
  const patientInput = getValidPatientInput();

  if (action === 'research-clear') {
    const result = handleClearStudyLog();
    showPrintNotice(result.message, !result.success);
    return;
  }

  if (!patientInput) {
    showPrintNotice('Enter valid patient data before exporting research records.', true);
    return;
  }

  if (action === 'research-add') {
    const result = handleAddToStudyLog(formState, patientInput, appDesign);
    showPrintNotice(result.message, !result.success);
    return;
  }

  if (action === 'research-export-current') {
    showPrintNotice('Preparing Excel export…', false);
    const result = await handleExportCurrentCase(formState, patientInput, appDesign);
    showPrintNotice(result.message, !result.success);
    return;
  }

  if (action === 'research-download') {
    showPrintNotice('Preparing Excel workbook…', false);
    const result = await handleDownloadWorkbook(formState, patientInput, appDesign, true);
    showPrintNotice(result.message, !result.success);
  }
}

function readFormFromDom(): void {
  const bedsideSex = document.getElementById('bedside-sex') as HTMLInputElement | null;
  if (bedsideSex?.value) {
    formState.sex = bedsideSex.value as FormState['sex'];
  } else {
    const sex = (document.querySelector('input[name="sex"]:checked') as HTMLInputElement)?.value as
      | 'female'
      | 'male';
    if (sex) formState.sex = sex;
  }

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
  formState.renalDisease = readYesNo('renalDisease');
  formState.tamoxifen = readYesNo('tamoxifen');
  formState.macularPathology = readYesNo('macularPathology');
  formState.ageAtStartOver60 = readYesNo('ageAtStartOver60');
  formState.hcqFiveYearsOrMore = readYesNo('hcqFiveYearsOrMore');
  const screeningDetails = document.querySelector('.screening-risks') as HTMLDetailsElement | null;
  if (screeningDetails) formState.screeningRisksOpen = screeningDetails.open;
}

function switchDesign(design: AppDesign): void {
  if (design === appDesign) return;
  readFormFromDom();
  appDesign = design;
  saveDesign(design);
  renderApp();
}

function renderApp(): void {
  applyDesignClass();

  const formHtml =
    appDesign === 'bedside'
      ? renderBedsideForm(formState)
      : renderCalculatorForm(formState);

  const tagline =
    appDesign === 'bedside'
      ? 'Point-of-care HCQ dosing · compare actual vs ideal body weight'
      : 'Hydroxychloroquine dosing &amp; screening guidance for eye care professionals';

  app.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        <h1>HCQ Dose Calculator</h1>
        <p class="tagline">${tagline}</p>
        ${renderDesignSwitcher(appDesign)}
      </div>
    </header>
    ${renderDisclaimer()}
    <main id="main" class="main">
      <div class="layout">
        <div id="form-root">${formHtml}</div>
        <div id="results-root" tabindex="-1"></div>
      </div>
    </main>
    <footer class="site-footer">
      <p>Formula version: AAO 2026 · NIH/NHLBI IBW · Browning lesser-of-weight · v1.1</p>
      <p class="site-footer__credit">
        Concept inspired by Dr Elliot Perlman&apos;s
        <a href="https://apps.apple.com/us/app/dosechecker/id1233772258" target="_blank" rel="noopener noreferrer">DoseChecker</a> (iOS).
      </p>
    </footer>
    ${renderStickyPrintBar(false)}
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

  formRoot.addEventListener(
    'toggle',
    (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('screening-risks')) {
        formState.screeningRisksOpen = (target as HTMLDetailsElement).open;
      }
    },
    true,
  );

  formRoot.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const sex = target.dataset.sex as FormState['sex'] | undefined;
    if (sex) {
      formState.sex = sex;
      renderApp();
      return;
    }

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

app.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.closest('[data-action="print"]')) {
    e.preventDefault();
    handlePrint();
    return;
  }

  const researchAction = target.closest('[data-action^="research-"]') as HTMLElement | null;
  if (researchAction?.dataset.action) {
    e.preventDefault();
    void handleResearchAction(researchAction.dataset.action);
    return;
  }

  const tab = target.closest('[data-design]') as HTMLElement | null;
  if (!tab?.dataset.design) return;
  e.preventDefault();
  switchDesign(tab.dataset.design as AppDesign);
});

renderApp();
