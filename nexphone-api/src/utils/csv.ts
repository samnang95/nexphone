/**
 * RFC 4180 compliant CSV generator utility.
 */

export type CsvCellValue = string | number | boolean | null | undefined;

export function escapeCsvCell(value: CsvCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvRow(cells: CsvCellValue[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export function generateCsv(headers: string[], rows: CsvCellValue[][]): string {
  const headerRow = buildCsvRow(headers);
  const dataRows = rows.map((r) => buildCsvRow(r));
  return [headerRow, ...dataRows].join("\r\n");
}
