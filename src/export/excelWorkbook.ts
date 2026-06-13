import ExcelJS from 'exceljs';
import { APP_VERSION, FORMULA_VERSION } from './constants.ts';
import { RESEARCH_COLUMNS, rowToOrderedValues, type ResearchRow } from './columnSchema.ts';

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

function buildGroupRanges(): { group: string; start: number; end: number }[] {
  const ranges: { group: string; start: number; end: number }[] = [];
  let currentGroup = '';
  let groupStart = 1;

  RESEARCH_COLUMNS.forEach((col, index) => {
    const colNum = index + 1;
    if (col.group !== currentGroup) {
      if (currentGroup) {
        ranges.push({ group: currentGroup, start: groupStart, end: colNum - 1 });
      }
      currentGroup = col.group;
      groupStart = colNum;
    }
  });

  ranges.push({ group: currentGroup, start: groupStart, end: RESEARCH_COLUMNS.length });
  return ranges;
}

function addStudyDataSheet(workbook: ExcelJS.Workbook, rows: ResearchRow[], meta: WorkbookMeta): void {
  const sheet = workbook.addWorksheet('Study_Data', {
    views: [{ state: 'frozen', ySplit: 6, xSplit: 0 }],
  });

  const lastCol = RESEARCH_COLUMNS.length;
  const lastColLetter = sheet.getColumn(lastCol).letter;

  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'HCQ Body Weight Formula Comparison — Study Export';
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
    'For authorised research use only. Anonymised subject IDs only — no patient identifiable information.';
  sheet.mergeCells(`A3:${lastColLetter}3`);
  sheet.getCell('A3').font = { italic: true, size: 9, color: { argb: 'FF64748B' } };

  const groupRow = sheet.getRow(5);
  groupRow.height = 22;
  for (const range of buildGroupRanges()) {
    const startLetter = sheet.getColumn(range.start).letter;
    const endLetter = sheet.getColumn(range.end).letter;
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
    { header: 'Column', key: 'column', width: 28 },
    { header: 'Header', key: 'header', width: 22 },
    { header: 'Group', key: 'group', width: 18 },
    { header: 'Description', key: 'description', width: 56 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  RESEARCH_COLUMNS.forEach((col) => {
    sheet.addRow({
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
