// Practice rules only. Replace schema, validation and metrics for the real question.
export const DASHBOARD_STORAGE_KEY = 'cofa.practice.dashboard.v1';
export const columns = [{ key: 'name', label: '이름' }, { key: 'category', label: '분류' }, { key: 'amount', label: '금액' }];
export function validateRow(row) {
  const errors = [];
  if (!String(row.name ?? '').trim()) errors.push('이름은 필수입니다');
  if (!String(row.category ?? '').trim()) errors.push('분류는 필수입니다');
  if (String(row.amount ?? '').trim() === '' || !Number.isFinite(Number(row.amount)) || Number(row.amount) < 0) errors.push('금액은 0 이상의 숫자여야 합니다');
  return errors;
}
export const schema = { columns, validateRow };
export const validDashboard = rows => Array.isArray(rows) && rows.every(r => typeof r.id === 'string' && !validateRow(r).length) && new Set(rows.map(r => r.id)).size === rows.length;
