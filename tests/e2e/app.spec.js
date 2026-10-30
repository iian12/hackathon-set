import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on('pageerror', err => page.__errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') page.__errors.push(msg.text()); });
  await page.goto('/');
  const identity = await page.request.get('/__server_identity').then(r => r.json());
  expect(identity.app).toBe('cofa-exam-kit');
  await expect(page.getByTestId('server-id')).toHaveText(identity.serverId);
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

test('starter input, click, empty input and server identity', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('작게');
  await page.getByLabel('확인할 내용').fill('실제 브라우저'); await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('확인: 실제 브라우저');
  await page.getByLabel('확인할 내용').fill('  '); await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('내용을 입력하세요.');
});
test('todo add/edit/complete/filter/delete and reload persistence', async ({ page }) => {
  await page.goto('/practice/todo');
  await page.getByLabel('할 일', { exact: true }).fill('연습하기'); await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1); await page.reload();
  await expect(page.getByText('연습하기', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '수정', exact: true }).click(); await page.getByLabel('할 일', { exact: true }).fill('검증하기'); await page.getByRole('button', { name: '저장', exact: true }).click();
  await page.getByRole('checkbox').check(); await page.reload(); await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByLabel('상태 필터').selectOption('active'); await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByLabel('상태 필터').selectOption('done'); await expect(page.getByText('검증하기', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '삭제', exact: true }).click(); await page.reload();
  await expect(page.getByText('표시할 할 일이 없습니다.')).toBeVisible();
});
test('todo rejects blank add and blank edit without losing original', async ({ page }) => {
  await page.goto('/practice/todo'); await page.getByLabel('할 일', { exact: true }).fill('   '); await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('할 일을 입력하세요.'); await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByLabel('할 일', { exact: true }).fill('보존할 작업'); await page.getByRole('button', { name: '추가', exact: true }).click();
  await page.getByRole('button', { name: '수정', exact: true }).click(); await page.getByLabel('할 일', { exact: true }).fill(''); await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible(); await expect(page.getByText('보존할 작업', { exact: true })).toBeVisible();
});
const upload = async (page, name, text) => page.getByLabel('CSV 파일', { exact: true }).setInputFiles({ name, mimeType: 'text/csv', buffer: Buffer.isBuffer(text) ? text : Buffer.from(text) });
const sample = 'name,category,amount\n연필,문구,10\n노트,문구,2\n커피,식음료,100';
test('CSV upload/search/filter/numeric sort/download/reload', async ({ page }) => {
  await page.goto('/practice/csv'); await upload(page, 'data.csv', sample);
  await expect(page.getByRole('status')).toContainText('3행을 불러왔습니다.'); await page.reload();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByLabel('분류 필터').selectOption('문구'); await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: '금액' }).click(); await expect(page.locator('tbody tr').first()).toContainText('노트');
  await page.getByRole('button', { name: '금액' }).click(); await expect(page.locator('tbody tr').first()).toContainText('연필');
  await page.getByLabel('데이터 검색').fill('연필'); await expect(page.locator('tbody tr')).toHaveCount(1);
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'CSV 다운로드' }).click(); const dl = await event;
  const content = await readFile(await dl.path(), 'utf8'); expect(content).toContain('연필,문구,10'); expect(content).not.toContain('노트');
  await page.getByLabel('데이터 검색').fill('없는값'); await expect(page.getByText('결과가 없습니다.')).toBeVisible(); await expect(page.getByRole('button', { name: 'CSV 다운로드' })).toBeDisabled();
});
test('CSV dashboard add/edit/delete persisted rows and blank validation', async ({ page }) => {
  await page.goto('/practice/csv'); await page.getByRole('button', { name: '행 추가', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('필수');
  for (const [label, value] of [['행 이름','책'],['행 분류','교육'],['행 금액','500']]) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: '행 추가', exact: true }).click(); await page.reload(); await expect(page.locator('tbody tr')).toContainText('책');
  await page.getByRole('button', { name: '수정', exact: true }).click(); await page.getByLabel('행 금액', { exact: true }).fill('-1'); await page.getByRole('button', { name: '행 저장', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('0 이상의');
  await page.getByLabel('행 금액', { exact: true }).fill('900'); await page.getByRole('button', { name: '행 저장', exact: true }).click(); await page.reload(); await expect(page.locator('tbody tr')).toContainText('900');
  await page.getByRole('button', { name: '삭제', exact: true }).click(); await page.reload(); await expect(page.getByText('결과가 없습니다.')).toBeVisible();
});
for (const [name, data, error] of [
  ['bad.txt', 'wrong', '.csv 파일'], ['empty.csv', '', '빈 파일'], ['missing.csv', 'name,amount\na,1', '필수 열 누락'],
  ['invalid.csv', 'name,category,amount\na,b,abc', '금액'], ['duplicate.csv', 'name,name,amount\na,b,1', '중복'],
  ['columns.csv', 'name,category,amount\na,b,1,extra', '열 수'], ['broken.csv', 'name,category,amount\n"bad,b,1', 'CSV 형식 오류'],
  ['header.csv', 'name,category,amount', '데이터 행'], ['encoding.csv', Buffer.from([0xff]), 'UTF-8'],
  ['large.csv', Buffer.alloc(2*1024*1024+1, 65), '2MB'],
]) test(`CSV invalid file ${name}: keep prior data`, async ({ page }) => {
  await page.goto('/practice/csv'); await upload(page, 'valid.csv', sample); await expect(page.locator('tbody tr')).toHaveCount(3);
  await upload(page, name, data); await expect(page.getByRole('alert')).toContainText(error); await expect(page.locator('tbody tr')).toHaveCount(3);
  // Same file can be selected again after validation error.
  await upload(page, name, data); await expect(page.getByRole('alert')).toContainText(error);
});
test('corrupted saved data shows recovery message', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('cofa.practice.todos.v1', '{broken'));
  await page.goto('/practice/todo'); await expect(page.getByRole('alert')).toContainText('저장 데이터를 읽을 수 없어'); await expect(page.getByText('표시할 할 일이 없습니다.')).toBeVisible();
});
test('storage write failure is visible while editing remains usable', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); }; });
  await page.goto('/practice/todo'); await page.getByLabel('할 일', { exact: true }).fill('메모'); await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('저장에 실패'); await expect(page.getByText('메모', { exact: true })).toBeVisible();
});
test('mobile layout has no page horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/practice/todo', '/practice/csv']) {
    await page.goto(path); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
