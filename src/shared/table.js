export function selectRows(rows, { query = '', filterKey, filter = '', sortKey, direction = 'asc', numericKeys = [] } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  const selected = rows.filter(row => (!filter || row[filterKey] === filter) && (!needle || Object.values(row).some(v => String(v).toLocaleLowerCase().includes(needle))));
  if (!sortKey) return selected;
  return selected.toSorted((a, b) => {
    const compared = numericKeys.includes(sortKey) ? Number(a[sortKey]) - Number(b[sortKey]) : String(a[sortKey]).localeCompare(String(b[sortKey]), 'ko');
    return direction === 'desc' ? -compared : compared;
  });
}
