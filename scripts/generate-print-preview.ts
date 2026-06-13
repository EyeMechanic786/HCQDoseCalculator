import { writeFileSync } from 'node:fs';
import { assessHcqDose } from '../src/calc/hcqDose.ts';
import { getScreeningGuidance } from '../src/calc/screening.ts';
import { buildPrintHtml } from '../src/print.ts';

const assessment = assessHcqDose(
  { sex: 'female', heightCm: 163, weightKg: 73, dailyDoseMg: 400 },
  'nhlbi',
);

const screeningComplete = getScreeningGuidance(assessment, {
  renalDisease: 'no',
  tamoxifen: 'no',
  macularPathology: 'no',
  ageAtStartOver60: 'no',
  hcqFiveYearsOrMore: 'no',
  hcqTwentyYearsOrMore: 'no',
});

const screeningWithRisk = getScreeningGuidance(assessment, {
  renalDisease: 'yes',
  tamoxifen: 'no',
  macularPathology: 'yes',
  ageAtStartOver60: 'no',
  hcqFiveYearsOrMore: 'yes',
  hcqTwentyYearsOrMore: 'yes',
});

const banner = `<!-- Demo print preview — open in browser, then Ctrl+P / Save as PDF -->
<!-- Default demo: female 163 cm, 73 kg, 400 mg/day -->`;

writeFileSync(
  'public/print-preview.html',
  banner + '\n' + buildPrintHtml(assessment, screeningComplete),
);

writeFileSync(
  'public/print-preview-with-risks.html',
  banner + '\n' + buildPrintHtml(assessment, screeningWithRisk),
);

console.log('Wrote public/print-preview.html and public/print-preview-with-risks.html');
