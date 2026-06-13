# HCQ Dose Calculator

A browser-based clinical decision-support tool for **ophthalmology and optometry professionals** to assess hydroxychloroquine (HCQ) daily dosing against retinal toxicity risk thresholds and screening guidance aligned with US and UK practice.

**For clinician use only.** This app is clinical decision support; it does not replace prescribing decisions, rheumatology consultation, or formal screening and monitoring protocols — including current [AAO (US)](https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h) and [RCOphth (UK)](https://www.rcophth.ac.uk/news-views/hydroxychloroquine-and-chloroquine-retinopathy/) guidance for NHS practice. It is **not FDA cleared** and is not a substitute for professional medical judgment.

## Acknowledgement

The **original concept** for a point-of-care hydroxychloroquine dose calculator — comparing actual and ideal body weight to guide safer prescribing — is credited to **Dr Elliot Perlman**, who developed [**DoseChecker**](https://apps.apple.com/us/app/dosechecker/id1233772258) for iOS (Massachusetts Eye and Ear). See [Perlman et al., *JAMA Ophthalmology* 2018](https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2666807).

**HCQ Dose Calculator** is an **independent web project** inspired by that work. It is not affiliated with Dr Perlman, Massachusetts Eye and Ear, or Apple, and is not the DoseChecker app.

## Live app

**https://eyemechanic786.github.io/HCQDoseCalculator/**

Every push to `main` rebuilds and redeploys via GitHub Actions.

## Two layouts

Use the **Dashboard** or **Bedside** tabs in the header to compare designs:

| Layout | Best for | What it shows |
|--------|----------|---------------|
| **Dashboard** | Desk / wide screen | Full comparison table, metrics grid, screening block |
| **Bedside** | Phone / exam lane | DoseChecker-inspired single column, ABW vs IBW columns, weekly regimen card |

Your layout choice is saved in the browser.

## Clinical background

Hydroxychloroquine retinopathy is dose-related. The American Academy of Ophthalmology (AAO) recommends keeping daily HCQ dose at **≤ 5.0 mg/kg actual body weight (real weight)**.

The app evaluates **three dosing methods** side by side:

### 1. AAO real body weight (primary guideline)

- **Threshold:** ≤ 5.0 mg/kg/day **actual body weight (ABW)**
- **Source:** [AAO Recommendations on Screening for HCQ Retinopathy (2026)](https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h)

### 2. Ideal body weight (historical ophthalmology literature)

- **Threshold:** ≤ 6.5 mg/kg/day **IBW**
- **IBW formulae:** NIH/NHLBI (Michaelides fit) or Devine — selectable in the app
- **Source:** [Michaelides et al. — IBW algorithms (PMC4116363)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4116363/)

### 3. Lesser-of-weight hybrid (“Browning-style”)

This is **not** a separate published equation. It applies a **literature-informed clinical rule**:

1. **Dosing weight** = `min(actual body weight, ideal body weight)`
2. **Safe daily dose** = **≤ 5.0 mg/kg** of that weight

**Why it exists:** David J. Browning and colleagues argue that dosing by **real weight alone** can overdose short obese patients, while dosing by **IBW alone** can overdose short asthenic (thin) patients. Using the **lower of ABW and IBW**, then applying the AAO rate (5 mg/kg), is intended to be safer across somatotypes.

| Patient type | Risk if only ABW used | Risk if only IBW used | Lesser-of-weight approach |
|--------------|----------------------|----------------------|---------------------------|
| Short, obese | Dose too high | — | Uses IBW (lower) |
| Short, asthenic | — | Dose too high | Uses ABW (lower) |

**Key references:**

- Browning DJ. [Safe dosing for HCQ dependent on body type](https://www.modernretina.com/view/safe-dosing-hcq-dependent-body-type). *Modern Retina*.
- Browning DJ et al. [Somatotype, HCQ retinopathy, and safe daily dosing guidelines (PMC5939880)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5939880/)

This method is shown for **comparison and discussion** — the official AAO standard remains **5 mg/kg actual weight**.

### 400 mg/day cap (severe obesity)

For **BMI ≥ 35**, AAO advises considering **≤ 400 mg/day** unless medically necessary with close monitoring.

### Bedside weekly regimen (DoseChecker-inspired)

The **Bedside** layout also shows a weekly maximum based on whichever of ABW or IBW yields the **lower weekly cap**, with a suggested mix of 200 mg and 400 mg tablet days — similar in spirit to the iOS **DoseChecker** app (Perlman et al., *JAMA Ophthalmology* 2018).

- [DoseChecker on the App Store](https://apps.apple.com/us/app/dosechecker/id1233772258)
- [JAMA Ophthalmology — Solving the HCQ dosing dilemma with a smartphone app](https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2666807)

## Formulae implemented

| Algorithm | Formula |
|-----------|---------|
| NIH/NHLBI (Michaelides fit) | IBW (lb) = 4.28 × height (in) − 134.32 |
| Devine | Female: 45.5 + 0.91×(cm−152.4); Male: 50 + 0.91×(cm−152.4) |
| Lesser-of-weight hybrid | Max daily dose = 5.0 × min(ABW, IBW) kg |
| Weekly cap (Bedside) | min(5.0×ABW×7, 6.5×IBW×7), capped at 2800 mg/week if BMI ≥ 35 |

## Reference case (demo defaults)

Female, 64 in (162.6 cm), 160 lb (72.7 kg), **400 mg/day**:

- mg/kg ABW ≈ 5.5 → **exceeds AAO 5.0 mg/kg**
- mg/kg IBW ≈ 6.3 → **within 6.5 mg/kg IBW threshold**
- Hybrid max ≈ 317 mg/day → **400 mg exceeds lesser-of-weight safe dose**

This illustrates why the app shows **multiple methods** rather than a single pass/fail.

## Features

- Instant dose assessment with traffic-light status per method (AAO, IBW, hybrid)
- **Dashboard** and **Bedside** layout toggle
- Metric and imperial unit toggles
- NIH/NHLBI and Devine IBW formula selection
- 400 mg/day obesity cap warning
- AAO 2025/2026 screening guidance with optional risk factors
- Printable summary for clinic handoff
- No server, no PHI storage — all calculations run in the browser

## Local development

Requires Node.js 18+ (22 recommended).

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173/HCQDoseCalculator/`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |

## Deployment (GitHub Pages)

1. Push to the `main` branch
2. Enable **GitHub Pages** → source: **GitHub Actions** (Settings → Pages)
3. The workflow in `.github/workflows/deploy-pages.yml` builds and deploys on every push

## Project structure

```
src/
  calc/          IBW, dose assessment, weekly regimen, screening logic
  ui/            Dashboard and Bedside form/results, layout switcher
  main.ts        App bootstrap
  print.ts       Printable summary window
tests/           Vitest unit tests for clinical math
```

## References

- [AAO Recommendations on Screening for HCQ Retinopathy (2026)](https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h)
- [PubMed: AAO 2025 Revision](https://pubmed.ncbi.nlm.nih.gov/41232611/)
- [RCOphth — Hydroxychloroquine and Chloroquine Retinopathy: Recommendations on Monitoring (UK, 2020)](https://www.rcophth.ac.uk/news-views/hydroxychloroquine-and-chloroquine-retinopathy/)
- [Michaelides et al. — IBW algorithms for HCQ screening (PMC4116363)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4116363/)
- [Browning — Somatotype and safe HCQ dosing (PMC5939880)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5939880/)
- [Browning — Safe dosing for HCQ dependent on body type (*Modern Retina*)](https://www.modernretina.com/view/safe-dosing-hcq-dependent-body-type)
- [Perlman et al. — DoseChecker app (*JAMA Ophthalmology* 2018)](https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2666807)

## Disclaimer

This software is provided for educational and clinical decision-support purposes only. It is **not FDA cleared**, not a medical device, and not a substitute for professional medical judgment. It does not replace current AAO or RCOphth UK screening and monitoring protocols. Always verify dosing with the prescribing physician and follow current institutional protocols.

See **Acknowledgement** above for credit to Dr Elliot Perlman's DoseChecker (iOS), which inspired this project.

Formula version: **AAO 2026 · NIH/NHLBI IBW · Browning lesser-of-weight · v1.1**

## License

MIT — see [LICENSE](LICENSE).
