import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on('pageerror', err => page.__errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') page.__errors.push(msg.text());
  });
  await page.goto('/');
  const response = await page.request.get('/__server_identity');
  expect(response.ok()).toBe(true);
  const identity = await response.json();
  expect(identity.app).toBe('cofa-exam-kit');
  await expect(page.getByTestId('server-id')).toHaveText(identity.serverId);
});

test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

// Adapt these infrastructure checks to the answer's acceptance criteria during the exam.
test('starter input, click, empty input and server identity', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('시험 시작 템플릿');
  await page.getByLabel('확인할 내용').fill('브라우저 연결');
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('확인: 브라우저 연결');
  await page.getByLabel('확인할 내용').fill('  ');
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('내용을 입력하세요.');
});

test('mobile starter has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByLabel('확인할 내용')).toBeVisible();
  await expect(page.getByRole('button', { name: '확인', exact: true })).toBeVisible();
});
