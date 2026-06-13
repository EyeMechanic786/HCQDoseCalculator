import ExcelJS from 'exceljs';
import { APP_VERSION, FORMULA_VERSION } from './constants.ts';
import {
  RESEARCH_COLUMNS,
  STUDY_DATA_COLUMNS,
  rowToOrderedValues,
  studyRowToOrderedValues,
  type ColumnDef,
  type ResearchRow,
  type StudyColumnDef,
  type StudyDataRow,
} from './columnSchema.ts';
import { buildStudyDataRowFromResearchRow } from './buildResearchRow.ts';

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },
};

const GROUP_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE2E8F0' },
};

const TITLE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF1F5F9' },
};

const ALT_ROW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF8FAFC' },
};

const STATUS_FILLS: Record<string, ExcelJS.Fill> = {
  within: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } },
  caution: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
  exceeds: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
};

const STATUS_FONTS: Record<string, Partial<ExcelJS.Font>> = {
  within: { color: { argb: 'FF14532D' }, bold: true },
  caution: { color: { argb: 'FF92400E' }, bold: true },
  exceeds: { color: { argb: 'FF991B1B' }, bold: true },
};

/** Rows below exported data that keep dropdown validation for manual entry. */
const TEMPLATE_ROWS = 50;
const DATA_START_ROW = 5;

export interface WorkbookMeta {
  studyId: string;
  siteId: string;
  exportTimestamp: string;
  rowCount: number;
}

function applyHeaderStyle(cell: ExcelJS.Cell): void {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  cell.fill = HEADER_FILL;
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FF334155' } },
    bottom: { style: 'thin', color: { argb: 'FF334155' } },
    left: { style: 'thin', color: { argb: 'FF334155' } },
    right: { style: 'thin', color: { argb: 'FF334155' } },
  };
}

function applyGroupStyle(cell: ExcelJS.Cell): void {
  cell.font = { bold: true, size: 10, color: { argb: 'FF1E293B' } };
  cell.fill = GROUP_FILL;
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = {
    bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
  };
}

function buildGroupRanges(columns: ColumnDef[]): { group: string; start: number; end: number }[] {
  const ranges: { group: string; start: number; end: number }[] = [];
  let currentGroup = '';
  let groupStart = 1;

  columns.forEach((col, index) => {
    const colNum = index + 1;
    if (col.group !== currentGroup) {
      if (currentGroup) {
        ranges.push({ group: currentGroup, start: groupStart, end: colNum - 1 });
      }
      currentGroup = col.group;
      groupStart = colNum;
    }
  });

  ranges.push({ group: currentGroup, start: groupStart, end: columns.length });
  return ranges;
}

function columnLetter(sheet: ExcelJS.Worksheet, index: number): string {
  return sheet.getColumn(index).letter;
}

function addDataValidation(sheet: ExcelJS.Worksheet, range: string, rule: ExcelJS.DataValidation): void {
  const validations = (sheet as ExcelJS.Worksheet & {
    dataValidations: { add: (address: string, validation: ExcelJS.DataValidation) => void };
  }).dataValidations;
  validations.add(range, rule);
}

function applyStudyValidations(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
): void {
  STUDY_DATA_COLUMNS.forEach((col, index) => {
    if (!col.validation) return;
    const colRef = columnLetter(sheet, index + 1);
    const range = `${colRef}${startRow}:${colRef}${endRow}`;

    if (col.validation.kind === 'list') {
      addDataValidation(sheet, range, {
        type: 'list',
        allowBlank: true,
        formulae: [`"${col.validation.values.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Invalid value',
        error: `Choose from: ${col.validation.values.join(', ')}`,
      });
    } else if (col.validation.kind === 'whole') {
      addDataValidation(sheet, range, {
        type: 'whole',
        operator: 'between',
        allowBlank: true,
        formulae: [col.validation.min, col.validation.max],
        showErrorMessage: true,
        errorTitle: 'Invalid duration',
        error: `Enter a whole number from ${col.validation.min} to ${col.validation.max}.`,
      });
    }
  });
}

function addStudyDataSheet(workbook: ExcelJS.Workbook, rows: ResearchRow[], meta: WorkbookMeta): void {
  const studyRows = rows.map((row) => buildStudyDataRowFromResearchRow(row));
  const sheet = workbook.addWorksheet('Study_Data', {
    views: [{ state: 'frozen', ySplit: DATA_START_ROW, xSplit: 0 }],
  });

  const lastCol = STUDY_DATA_COLUMNS.length;
  const lastColLetter = columnLetter(sheet, lastCol);

  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'HCQ Study Data — Patient Record Sheet';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  titleCell.fill = TITLE_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 28;

  sheet.getCell('A2').value = 'Study ID';
  sheet.getCell('B2').value = meta.studyId || '(not set)';
  sheet.getCell('C2').value = 'Site ID';
  sheet.getCell('D2').value = meta.siteId || '(not set)';
  sheet.getCell('E2').value = 'Exported';
  sheet.getCell('F2').value = meta.exportTimestamp;
  sheet.getCell('G2').value = 'Cases';
  sheet.getCell('H2').value = meta.rowCount;
  sheet.getRow(2).font = { size: 10 };

  sheet.getCell('A3').value =
    'Anonymous Patient IDs only. Gender and dose columns use dropdowns; duration accepts 0–100 years.';
  sheet.mergeCells(`A3:${lastColLetter}3`);
  sheet.getCell('A3').font = { italic: true, size: 9, color: { argb: 'FF64748B' } };

  const headerRow = sheet.getRow(DATA_START_ROW);
  headerRow.height = 40;
  STUDY_DATA_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    applyHeaderStyle(cell);
    sheet.getColumn(index + 1).width = col.width;
  });

  const totalDataRows = Math.max(studyRows.length, 1) + TEMPLATE_ROWS;
  const lastDataRow = DATA_START_ROW + totalDataRows;

  studyRows.forEach((row, rowIndex) => {
    writeStudyRow(sheet, DATA_START_ROW + 1 + rowIndex, row, rowIndex % 2 === 1);
  });

  applyStudyValidations(sheet, DATA_START_ROW + 1, lastDataRow);

  sheet.autoFilter = {
    from: { row: DATA_START_ROW, column: 1 },
    to: { row: DATA_START_ROW + studyRows.length, column: lastCol },
  };
}

function writeStudyRow(
  sheet: ExcelJS.Worksheet,
  rowNum: number,
  row: StudyDataRow,
  altStripe: boolean,
): void {
  const excelRow = sheet.getRow(rowNum);
  const values = studyRowToOrderedValues(row);
  values.forEach((value, colIndex) => {
    const cell = excelRow.getCell(colIndex + 1);
    cell.value = value;
    cell.font = { size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: colIndex === 0 ? 'left' : 'center' };

    const colDef = STUDY_DATA_COLUMNS[colIndex] as StudyColumnDef;
    if (colDef.numberFormat) {
      cell.numFmt = colDef.numberFormat;
    }
    if (altStripe) {
      cell.fill = ALT_ROW_FILL;
    }
  });
}

function addDetailedDataSheet(workbook: ExcelJS.Workbook, rows: ResearchRow[], meta: WorkbookMeta): void {
  const sheet = workbook.addWorksheet('Detailed_Data', {
    views: [{ state: 'frozen', ySplit: 6, xSplit: 0 }],
  });

  const lastCol = RESEARCH_COLUMNS.length;
  const lastColLetter = columnLetter(sheet, lastCol);

  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'HCQ Body Weight Formula Comparison — Full Technical Export';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  titleCell.fill = TITLE_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 28;

  sheet.getCell('A2').value = 'Study ID';
  sheet.getCell('B2').value = meta.studyId || '(not set)';
  sheet.getCell('C2').value = 'Site ID';
  sheet.getCell('D2').value = meta.siteId || '(not set)';
  sheet.getCell('E2').value = 'Exported';
  sheet.getCell('F2').value = meta.exportTimestamp;
  sheet.getCell('G2').value = 'Cases';
  sheet.getCell('H2').value = meta.rowCount;
  sheet.getCell('I2').value = 'App version';
  sheet.getCell('J2').value = APP_VERSION;
  sheet.getRow(2).font = { size: 10 };

  sheet.getCell('A3').value =
    'Full calculator output including all dosing methods, screening flags, and weekly regimen.';
  sheet.mergeCells(`A3:${lastColLetter}3`);
  sheet.getCell('A3').font = { italic: true, size: 9, color: { argb: 'FF64748B' } };

  const groupRow = sheet.getRow(5);
  groupRow.height = 22;
  for (const range of buildGroupRanges(RESEARCH_COLUMNS)) {
    const startLetter = columnLetter(sheet, range.start);
    const endLetter = columnLetter(sheet, range.end);
    sheet.mergeCells(`${startLetter}5:${endLetter}5`);
    const cell = sheet.getCell(`${startLetter}5`);
    cell.value = range.group;
    applyGroupStyle(cell);
  }

  const headerRow = sheet.getRow(6);
  headerRow.height = 36;
  RESEARCH_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    applyHeaderStyle(cell);
    sheet.getColumn(index + 1).width = col.width;
  });

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(7 + rowIndex);
    const values = rowToOrderedValues(row);
    values.forEach((value, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1);
      cell.value = value;
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'top', wrapText: colIndex >= RESEARCH_COLUMNS.length - 2 };

      const colDef = RESEARCH_COLUMNS[colIndex];
      if (colDef?.statusColumn && typeof value === 'string') {
        const statusKey = value as keyof typeof STATUS_FILLS;
        if (STATUS_FILLS[statusKey]) {
          cell.fill = STATUS_FILLS[statusKey];
          cell.font = { ...STATUS_FONTS[statusKey], size: 10 };
        }
      }
    });
  });

  sheet.autoFilter = {
    from: { row: 6, column: 1 },
    to: { row: 6 + rows.length, column: lastCol },
  };
}

function addDataDictionarySheet(workbook: ExcelJS.Workbook): void {
  const sheet = workbook.addWorksheet('Data_Dictionary');
  sheet.columns = [
    { header: 'Sheet', key: 'sheet', width: 14 },
    { header: 'Column', key: 'column', width: 28 },
    { header: 'Header', key: 'header', width: 24 },
    { header: 'Group', key: 'group', width: 18 },
    { header: 'Description', key: 'description', width: 56 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  STUDY_DATA_COLUMNS.forEach((col) => {
    sheet.addRow({
      sheet: 'Study_Data',
      column: col.key,
      header: col.header,
      group: col.group,
      description: col.description,
    });
  });

  RESEARCH_COLUMNS.forEach((col) => {
    sheet.addRow({
      sheet: 'Detailed_Data',
      column: col.key,
      header: col.header,
      group: col.group,
      description: col.description,
    });
  });
}

function addExportInfoSheet(workbook: ExcelJS.Workbook, meta: WorkbookMeta): void {
  const sheet = workbook.addWorksheet('Export_Info');
  const info: [string, string | number][] = [
    ['Export timestamp', meta.exportTimestamp],
    ['Study ID', meta.studyId || '(not set)'],
    ['Site ID', meta.siteId || '(not set)'],
    ['Cases exported', meta.rowCount],
    ['App version', APP_VERSION],
    ['Formula version', FORMULA_VERSION],
    ['Primary sheet', 'Study_Data (9 patient columns with dropdown validation)'],
    ['Detailed sheet', 'Detailed_Data (full technical export)'],
    ['Tool', 'HCQ Dose Calculator (GitHub Pages)'],
    ['Disclaimer', 'Clinical decision support only. Does not replace AAO or RCOphth protocols.'],
    ['AAO reference', 'AAO Recommendations on Screening for HCQ Retinopathy (2026)'],
    ['RCOphth reference', 'Hydroxychloroquine and Chloroquine Retinopathy: Recommendations on Monitoring (UK, 2020)'],
  ];

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 64;

  info.forEach(([label, value], index) => {
    const row = sheet.getRow(index + 1);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(2).value = value;
    row.getCell(2).font = { size: 10 };
    row.getCell(2).alignment = { wrapText: true };
  });
}

export async function buildWorkbookBlob(
  rows: ResearchRow[],
  meta: WorkbookMeta,
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HCQ Dose Calculator';
  workbook.created = new Date();

  addStudyDataSheet(workbook, rows, meta);
  addDetailedDataSheet(workbook, rows, meta);
  addDataDictionarySheet(workbook);
  addExportInfoSheet(workbook, meta);

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function workbookFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `HCQ_Study_Export_${date}.xlsx`;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportResearchWorkbook(
  rows: ResearchRow[],
  studyId: string,
  siteId: string,
): Promise<void> {
  const meta: WorkbookMeta = {
    studyId,
    siteId,
    exportTimestamp: new Date().toISOString(),
    rowCount: rows.length,
  };
  const blob = await buildWorkbookBlob(rows, meta);
  triggerDownload(blob, workbookFilename());
}
