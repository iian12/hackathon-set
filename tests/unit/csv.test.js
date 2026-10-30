import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, readCsvFile, toCsv, CSV_LIMITS } from '../../src/shared/csv.js';
import { schema } from '../../src/domain/dashboard.js';
import { selectRows } from '../../src/shared/table.js';

test('CSV: BOM, CRLF, quoted commas/newlines and escaped quote', () => {
  const rows = parseCsv('\uFEFFname,category,amount\r\n"연필, HB",문구,0\r\n"노트\n""A""",문구,10', schema);
  assert.equal(rows.length, 2); assert.equal(rows[0].name, '연필, HB'); assert.equal(rows[1].name, '노트\n"A"');
});
test('CSV rejects missing/duplicate/empty headers, malformed rows and invalid amounts', () => {
  for (const csv of ['', 'name,category,amount', 'name,amount\na,1', 'name,name,amount\na,b,1', 'name,,amount\na,b,1', 'name,category,amount\na,b', 'name,category,amount\na,b,1,2', 'name,category,amount\na,b,-1', 'name,category,amount\na,b,NaN', 'name,category,amount\na,b,', 'name,category,amount\n,b,2', 'name,category,amount\n"bad,b,2']) assert.throws(() => parseCsv(csv, schema), csv);
});
test('CSV rejects too many rows atomically', () => assert.throws(() => parseCsv('name,category,amount\na,b,1\nc,d,2', { ...schema, maxRows: 1 }), /최대 1행/));
test('file validation: extension, zero bytes, oversize, invalid UTF-8', async () => {
  const file = (name, bytes) => new File([bytes], name);
  await assert.rejects(readCsvFile(file('a.txt', 'text'), schema), /\.csv/);
  await assert.rejects(readCsvFile(file('a.csv', ''), schema), /빈 파일/);
  await assert.rejects(readCsvFile({ name: 'a.csv', size: CSV_LIMITS.maxBytes + 1 }, schema), /2MB/);
  await assert.rejects(readCsvFile(file('a.csv', new Uint8Array([0xff])), schema), /UTF-8/);
});
test('CSV round trip and spreadsheet formula escape', () => {
  const rows = [{ name: '한글, "메모"', category: '문구', amount: '100' }];
  assert.deepEqual(parseCsv(toCsv(rows, schema.columns), schema), rows);
  assert.match(toCsv([{ name: '=1+1', category: '@x', amount: '0' }], schema.columns), /'=1\+1/);
});
test('search, category filter, numeric sort without mutation', () => {
  const rows = [{ name: 'ABC', category: 'x', amount: '10' }, { name: 'abc 2', category: 'x', amount: '2' }, { name: 'xyz', category: 'y', amount: '1' }];
  assert.deepEqual(selectRows(rows, { query: 'ABC', filterKey: 'category', filter: 'x', sortKey: 'amount', numericKeys: ['amount'] }).map(r => r.amount), ['2', '10']);
  assert.equal(rows[0].amount, '10'); assert.equal(selectRows(rows, { query: 'none' }).length, 0);
});
