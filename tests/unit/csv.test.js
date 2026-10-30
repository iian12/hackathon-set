import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, readCsvFile, toCsv, CSV_LIMITS } from '../../src/shared/csv.js';
import { selectRows } from '../../src/shared/table.js';

// Local fixtures exercise the generic parser and its caller-supplied validation hook.
const schema = {
  columns: [{ key: 'value', label: '값' }],
  validateRow: row => row.value === 'reject' ? ['custom validation failed'] : [],
};

test('CSV: BOM, CRLF, quoted commas/newlines and escaped quote', () => {
  const rows = parseCsv('\uFEFFvalue\r\n"가,나"\r\n"줄1\n""줄2"""', schema);
  assert.deepEqual(rows, [{ value: '가,나' }, { value: '줄1\n"줄2"' }]);
});

test('CSV rejects missing/duplicate/empty headers, malformed rows and caller validation failures', () => {
  for (const csv of [
    '', 'value', 'other\na', 'value,value\na,b', 'value,\na,b',
    'value\na,b', 'value\n"unclosed', 'value\nreject',
  ]) assert.throws(() => parseCsv(csv, schema), csv);
  assert.throws(() => parseCsv('value\nreject', schema), /custom validation failed/);
});

test('CSV rejects too many rows atomically', () => {
  assert.throws(() => parseCsv('value\na\nb', { ...schema, maxRows: 1 }), /최대 1행/);
});

test('file validation: extension, zero bytes, oversize, invalid UTF-8', async () => {
  const file = (name, bytes) => new File([bytes], name);
  await assert.rejects(readCsvFile(file('a.txt', 'text'), schema), /\.csv/);
  await assert.rejects(readCsvFile(file('a.csv', ''), schema), /빈 파일/);
  await assert.rejects(readCsvFile({ name: 'a.csv', size: CSV_LIMITS.maxBytes + 1 }, schema), /2MB/);
  await assert.rejects(readCsvFile(file('a.csv', new Uint8Array([0xff])), schema), /UTF-8/);
});

test('CSV round trip and spreadsheet formula escape', () => {
  const rows = [{ value: '한글, "값"' }, { value: '0' }];
  assert.deepEqual(parseCsv(toCsv(rows, schema.columns), schema), rows);
  assert.match(toCsv([{ value: '=1+1' }], schema.columns), /'=1\+1/);
});

test('search, filter and numeric sort do not mutate source rows', () => {
  const rows = [
    { text: 'ABC', group: 'x', score: '10' },
    { text: 'abc 2', group: 'x', score: '2' },
    { text: 'xyz', group: 'y', score: '1' },
  ];
  assert.deepEqual(selectRows(rows, {
    query: 'ABC', filterKey: 'group', filter: 'x', sortKey: 'score', numericKeys: ['score'],
  }).map(r => r.score), ['2', '10']);
  assert.equal(rows[0].score, '10');
  assert.equal(selectRows(rows, { query: 'none' }).length, 0);
});
