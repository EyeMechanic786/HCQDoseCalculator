export interface ColumnDef {
  key: string;
  header: string;
  group: string;
  description: string;
  width: number;
  statusColumn?: boolean;
}

function methodColumns(prefix: string, group: string, methodLabel: string): ColumnDef[] {
  return [
    {
      key: `${prefix}_mg_per_kg`,
      header: 'mg/kg',
      group,
      description: `Current mg/kg for ${methodLabel}`,
      width: 10,
    },
    {
      key: `${prefix}_threshold_mg_per_kg`,
      header: 'Threshold mg/kg',
      group,
      description: `Guideline threshold mg/kg for ${methodLabel}`,
      width: 14,
    },
    {
      key: `${prefix}_max_daily_mg`,
      header: 'Max mg/day',
      group,
      description: `Maximum recommended daily dose for ${methodLabel}`,
      width: 12,
    },
    {
      key: `${prefix}_status`,
      header: 'Status',
      group,
      description: `Traffic-light status for ${methodLabel} (within / caution / exceeds)`,
      width: 12,
      statusColumn: true,
    },
    {
      key: `${prefix}_delta_mg_per_kg`,
      header: 'Δ mg/kg',
      group,
      description: `Current mg/kg minus threshold for ${methodLabel}`,
      width: 10,
    },
    {
      key: `${prefix}_within_guideline`,
      header: 'Within?',
      group,
      description: `Y if status is within guideline for ${methodLabel}`,
      width: 10,
    },
  ];
}

export const RESEARCH_COLUMNS: ColumnDef[] = [
  { key: 'record_id', header: 'Record ID', group: 'Record', description: 'Unique export record identifier', width: 18 },
  { key: 'export_timestamp', header: 'Timestamp', group: 'Record', description: 'ISO datetime when case was saved', width: 22 },
  { key: 'app_version', header: 'App version', group: 'Record', description: 'Calculator software version', width: 12 },
  { key: 'formula_version', header: 'Formula version', group: 'Record', description: 'Clinical formula set used', width: 28 },
  { key: 'layout_used', header: 'Layout', group: 'Record', description: 'Dashboard or bedside UI layout', width: 12 },
  { key: 'study_id', header: 'Study ID', group: 'Record', description: 'Optional anonymised study identifier', width: 14 },
  { key: 'site_id', header: 'Site ID', group: 'Record', description: 'Optional site identifier', width: 12 },
  { key: 'patient_id', header: 'Patient ID', group: 'Record', description: 'Anonymous sequential patient identifier (no PHI)', width: 14 },
  { key: 'encounter_date', header: 'Encounter date', group: 'Record', description: 'Date of assessment (YYYY-MM-DD)', width: 14 },

  { key: 'sex', header: 'Sex', group: 'Inputs', description: 'Biological sex used for IBW formula', width: 10 },
  { key: 'height_cm', header: 'Height (cm)', group: 'Inputs', description: 'Height normalised to centimetres', width: 12 },
  { key: 'height_entered', header: 'Height entered', group: 'Inputs', description: 'Height as entered in the UI', width: 14 },
  { key: 'height_unit', header: 'Height unit', group: 'Inputs', description: 'cm or ft/in', width: 12 },
  { key: 'weight_kg', header: 'Weight (kg)', group: 'Inputs', description: 'Actual body weight normalised to kg', width: 12 },
  { key: 'weight_entered', header: 'Weight entered', group: 'Inputs', description: 'Weight as entered in the UI', width: 14 },
  { key: 'weight_unit', header: 'Weight unit', group: 'Inputs', description: 'kg or lb', width: 12 },
  { key: 'daily_hcq_mg', header: 'Daily HCQ (mg)', group: 'Inputs', description: 'Prescribed daily hydroxychloroquine dose', width: 14 },
  { key: 'ibw_algorithm_ui', header: 'IBW UI selection', group: 'Inputs', description: 'IBW algorithm selected in the UI (nhlbi or devine)', width: 16 },

  { key: 'abw_kg', header: 'ABW (kg)', group: 'Anthropometrics', description: 'Actual body weight (kg)', width: 10 },
  { key: 'ibw_nhlbi_kg', header: 'IBW NIH/NHLBI (kg)', group: 'Anthropometrics', description: 'Ideal body weight via NIH/NHLBI formula', width: 18 },
  { key: 'ibw_devine_kg', header: 'IBW Devine (kg)', group: 'Anthropometrics', description: 'Ideal body weight via Devine formula', width: 16 },
  { key: 'dosing_weight_kg', header: 'Dosing weight UI (kg)', group: 'Anthropometrics', description: 'min(ABW, IBW) using UI-selected IBW algorithm', width: 18 },
  { key: 'dosing_weight_nhlbi_kg', header: 'Dosing wt NHLBI (kg)', group: 'Anthropometrics', description: 'min(ABW, IBW NIH/NHLBI)', width: 18 },
  { key: 'dosing_weight_devine_kg', header: 'Dosing wt Devine (kg)', group: 'Anthropometrics', description: 'min(ABW, IBW Devine)', width: 18 },
  { key: 'bmi', header: 'BMI', group: 'Anthropometrics', description: 'Body mass index from ABW and height', width: 8 },
  { key: 'severe_obesity_bmi35', header: 'BMI ≥35', group: 'Anthropometrics', description: 'Y if BMI ≥ 35 (severe obesity cap applies)', width: 10 },

  ...methodColumns('aao_abw', 'AAO (ABW)', 'AAO ≤5.0 mg/kg actual body weight'),
  ...methodColumns('ibw_nhlbi', 'IBW NIH/NHLBI', 'IBW ≤6.5 mg/kg (NIH/NHLBI)'),
  ...methodColumns('ibw_devine', 'IBW Devine', 'IBW ≤6.5 mg/kg (Devine)'),
  ...methodColumns('hybrid_nhlbi', 'Hybrid (NHLBI)', '≤5.0 mg/kg min(ABW, IBW NIH/NHLBI)'),
  ...methodColumns('hybrid_devine', 'Hybrid (Devine)', '≤5.0 mg/kg min(ABW, IBW Devine)'),

  { key: 'methods_within_count', header: 'Methods within', group: 'Comparison', description: 'Count of methods with within status (of 5)', width: 14 },
  { key: 'methods_exceed_count', header: 'Methods exceed', group: 'Comparison', description: 'Count of methods with exceeds status', width: 14 },
  { key: 'any_method_exceeds', header: 'Any exceeds?', group: 'Comparison', description: 'Y if any of the 5 methods exceeds guideline', width: 14 },
  { key: 'aao_vs_ibw_nhlbi_disagree', header: 'AAO≠IBW NHLBI', group: 'Comparison', description: 'Y if AAO and IBW NIH/NHLBI statuses differ', width: 14 },
  { key: 'aao_vs_ibw_devine_disagree', header: 'AAO≠IBW Devine', group: 'Comparison', description: 'Y if AAO and IBW Devine statuses differ', width: 14 },
  { key: 'aao_vs_hybrid_nhlbi_disagree', header: 'AAO≠Hybrid NHLBI', group: 'Comparison', description: 'Y if AAO and hybrid NHLBI statuses differ', width: 16 },
  { key: 'aao_vs_hybrid_devine_disagree', header: 'AAO≠Hybrid Devine', group: 'Comparison', description: 'Y if AAO and hybrid Devine statuses differ', width: 16 },
  { key: 'ibw_nhlbi_vs_devine_disagree', header: 'IBW NHLBI≠Devine', group: 'Comparison', description: 'Y if IBW NIH/NHLBI and Devine statuses differ', width: 16 },

  { key: 'cap400_applicable', header: 'Cap applicable', group: 'Obesity cap', description: 'Y if BMI ≥ 35', width: 14 },
  { key: 'cap400_exceeded', header: 'Cap exceeded', group: 'Obesity cap', description: 'Y if dose > 400 mg/day with BMI ≥ 35', width: 14 },
  { key: 'cap400_message', header: 'Cap message', group: 'Obesity cap', description: 'AAO 400 mg/day obesity cap advisory text', width: 40 },

  { key: 'max_weekly_abw_mg', header: 'Max weekly ABW', group: 'Weekly regimen', description: 'Maximum safe weekly dose by ABW (mg)', width: 16 },
  { key: 'max_weekly_ibw_mg', header: 'Max weekly IBW', group: 'Weekly regimen', description: 'Maximum safe weekly dose by IBW (mg)', width: 16 },
  { key: 'governing_weekly_mg', header: 'Governing weekly mg', group: 'Weekly regimen', description: 'Lower of ABW/IBW weekly cap (mg)', width: 18 },
  { key: 'governing_method', header: 'Governing method', group: 'Weekly regimen', description: 'abw or ibw — which weight governs weekly cap', width: 16 },
  { key: 'days_at_400mg', header: 'Days at 400 mg', group: 'Weekly regimen', description: 'Suggested days per week at 400 mg', width: 14 },
  { key: 'days_at_200mg', header: 'Days at 200 mg', group: 'Weekly regimen', description: 'Suggested days per week at 200 mg', width: 14 },
  { key: 'off_days', header: 'Off days', group: 'Weekly regimen', description: 'Suggested days per week off medication', width: 10 },
  { key: 'schedule_summary', header: 'Schedule summary', group: 'Weekly regimen', description: 'Human-readable weekly tablet schedule', width: 36 },
  { key: 'current_weekly_mg', header: 'Current weekly mg', group: 'Weekly regimen', description: 'Patient current dose × 7 days', width: 16 },
  { key: 'current_exceeds_safe', header: 'Exceeds safe?', group: 'Weekly regimen', description: 'Y if current weekly dose exceeds governing cap', width: 14 },

  { key: 'renal_disease', header: 'Renal disease', group: 'Screening', description: 'Concurrent renal disease (yes/no/blank)', width: 14 },
  { key: 'tamoxifen', header: 'Tamoxifen', group: 'Screening', description: 'Concurrent tamoxifen (yes/no/blank)', width: 12 },
  { key: 'macular_pathology', header: 'Macular pathology', group: 'Screening', description: 'Pre-existing macular pathology (yes/no/blank)', width: 16 },
  { key: 'hcq_started_after_60', header: 'HCQ start >60', group: 'Screening', description: 'HCQ started after age 60 (yes/no/blank)', width: 14 },
  { key: 'on_hcq_ge_5_years', header: 'HCQ ≥5 years', group: 'Screening', description: 'On HCQ ≥5 years (yes/no/blank)', width: 14 },
  { key: 'risk_factors_complete', header: 'Risks complete', group: 'Screening', description: 'Y if all screening risk factors answered', width: 14 },
  { key: 'identified_risk_count', header: 'Risk count', group: 'Screening', description: 'Number of Yes risk factors', width: 12 },
  { key: 'identified_risk_factors', header: 'Risk factors', group: 'Screening', description: 'Semicolon-separated list of Yes risk factors', width: 36 },
  { key: 'elevated_screening_risk', header: 'Elevated risk', group: 'Screening', description: 'Y if elevated screening risk flagged', width: 14 },
  { key: 'annual_screening_recommended', header: 'Annual screening', group: 'Screening', description: 'Y if annual screening recommended', width: 16 },
  { key: 'defer_first_5_years', header: 'Defer 5 yr', group: 'Screening', description: 'Y if annual screening may be deferred first 5 years', width: 12 },

  { key: 'dose_narrative', header: 'Dose narrative', group: 'Notes', description: 'Full dose comparison narrative', width: 48 },
  { key: 'tablet_note', header: 'Tablet note', group: 'Notes', description: 'Nearest practical 200 mg tablet step', width: 36 },
];

export type ResearchRow = Record<string, string | number>;

export function rowToOrderedValues(row: ResearchRow): (string | number)[] {
  return RESEARCH_COLUMNS.map((col) => row[col.key] ?? '');
}
