# HCQ Dose Calculator

A browser-based clinical decision-support tool for **ophthalmology and optometry professionals** to assess hydroxychloroquine (HCQ) daily dosing against retinal toxicity risk thresholds and AAO screening guidance.

**For clinician use only.** This app supports clinical judgment; it does not replace prescribing decisions, rheumatology consultation, or formal AAO screening protocols.

## Live app

After deployment: `https://<username>.github.io/HCQDoseCalculator/`

## Clinical background

Hydroxychloroquine retinopathy is dose-related. The American Academy of Ophthalmology (AAO) recommends keeping daily HCQ dose at **≤ 5.0 mg/kg actual body weight (real weight)**.

Literature also supports ideal body weight (IBW) approaches:

- Historical IBW threshold: **≤ 6.5 mg/kg IBW**
- Browning/Michaelides somatotype guidance: use the **lesser of actual body weight and IBW** as the dosing weight, then apply **5.0 mg/kg**
- For **severely obese** patients (BMI ≥ 35), AAO advises considering **≤ 400 mg/day** unless medically necessary with close monitoring

### Formulae implemented

| Algorithm | Formula |
|-----------|---------|
| NIH/NHLBI (Michaelides fit) | IBW (lb) = 4.28 × height (in) − 134.32 |
| Devine | Female: 45.5 + 0.91×(cm−152.4); Male: 50 + 0.91×(cm−152.4) |

### Reference case (demo)

Female, 64 in (162.6 cm), 160 lb (72.7 kg), **400 mg/day**:

- mg/kg ABW ≈ 5.5 → **exceeds AAO 5.0 mg/kg**
- mg/kg IBW ≈ 6.3 → **within 6.5 mg/kg IBW threshold**
- Hybrid max ≈ 317 mg → **400 mg exceeds lesser-of-weight safe dose**

## Features

- Instant dose assessment with traffic-light status per method (AAO, IBW, hybrid)
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

1. Create a GitHub repository named `HCQDoseCalculator`
2. Push this project to the `main` branch
3. Enable **GitHub Pages** → source: **GitHub Actions**
4. The workflow in `.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`

## Project structure

```
src/
  calc/          Pure calculation functions (IBW, dose assessment, screening)
  ui/            Form and results rendering
  main.ts        App bootstrap
  print.ts       Printable summary window
tests/           Vitest unit tests for clinical math
```

## References

- [AAO Recommendations on Screening for HCQ Retinopathy (2026)](https://www.aao.org/education/clinical-statement/revised-recommendations-on-screening-chloroquine-h)
- [PubMed: AAO 2025 Revision](https://pubmed.ncbi.nlm.nih.gov/41232611/)
- [Michaelides et al. — IBW algorithms for HCQ screening (PMC4116363)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4116363/)
- Browning DJ. Safe dosing for HCQ dependent on body type. *Modern Retina*.

## Disclaimer

This software is provided for educational and clinical decision-support purposes only. It is **not FDA cleared**, not a medical device, and not a substitute for professional medical judgment. Always verify dosing with the prescribing physician and follow current institutional protocols.

Formula version: **AAO 2026 · NIH/NHLBI IBW · v1.0**

## License

MIT — see repository for details.
