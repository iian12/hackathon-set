import Papa from 'papaparse';

export const CSV_LIMITS = { maxBytes: 2 * 1024 * 1024, maxRows: 10000 };
export function parseCsv(text, { columns, validateRow = () => [], maxRows = CSV_LIMITS.maxRows }) {
  const result = Papa.parse(text.replace(/^\uFEFF/, ''), { header: false, skipEmptyLines: 'greedy', delimiter: ',' });
  if (result.errors.length) throw new Error(`CSV 형식 오류: ${result.errors[0].message}`);
  const [rawHeaders, ...records] = result.data;
  if (!rawHeaders) throw new Error('CSV가 비어 있습니다.');
  const headers = rawHeaders.map(h => h.trim());
  if (headers.some(h => !h) || new Set(headers).size !== headers.length) throw new Error('헤더가 비어 있거나 중복되었습니다.');
  const missing = columns.filter(c => !headers.includes(c.key));
  if (missing.length) throw new Error(`필수 열 누락: ${missing.map(c => c.key).join(', ')}`);
  if (!records.length) throw new Error('CSV에 데이터 행이 없습니다.');
  if (records.length > maxRows) throw new Error(`최대 ${maxRows}행까지 업로드할 수 있습니다.`);
  const rows = [], errors = [];
  records.forEach((record, i) => {
    if (record.length !== headers.length) { errors.push(`${i + 2}행: 열 수가 헤더와 다릅니다.`); return; }
    const row = Object.fromEntries(headers.map((h, j) => [h, record[j].trim()]));
    const issues = validateRow(row);
    if (issues.length) errors.push(`${i + 2}행: ${issues.join(', ')}`);
    else rows.push(row);
  });
  if (errors.length) throw new Error(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n외 ${errors.length - 5}개 오류` : ''));
  return rows;
}

export async function readCsvFile(file, schema) {
  if (!file || !/\.csv$/i.test(file.name)) throw new Error('.csv 파일을 선택하세요.');
  if (!file.size) throw new Error('빈 파일입니다.');
  if (file.size > CSV_LIMITS.maxBytes) throw new Error('파일은 2MB 이하여야 합니다.');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer()); }
  catch { throw new Error('UTF-8 CSV 파일로 다시 저장하세요.'); }
  return parseCsv(text, schema);
}

export function toCsv(rows, columns) {
  return '\uFEFF' + Papa.unparse({ fields: columns.map(c => c.key), data: rows.map(row => columns.map(c => row[c.key] ?? '')) }, { escapeFormulae: true, newline: '\r\n' });
}
export function downloadCsv(rows, columns, filename = 'export.csv') {
  const url = URL.createObjectURL(new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
