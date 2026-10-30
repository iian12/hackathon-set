import { useRef, useState } from 'react';
import { columns, schema, validateRow, DASHBOARD_STORAGE_KEY, validDashboard } from '../domain/dashboard.js';
import { readCsvFile, downloadCsv } from '../shared/csv.js';
import { selectRows } from '../shared/table.js';
import { DataTable } from '../shared/DataTable.jsx';
import { ErrorMessage } from '../shared/Feedback.jsx';
import { useLocalStorage } from '../shared/useLocalStorage.js';

const blank = { name: '', category: '', amount: '' };
export function Dashboard() {
  const [rows, save, storageError] = useLocalStorage(DASHBOARD_STORAGE_KEY, [], validDashboard);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  const [draft, setDraft] = useState(blank), [editing, setEditing] = useState(null);
  const uploadTicket = useRef(0);
  const visible = selectRows(rows, { query, filterKey: 'category', filter: category, sortKey: sort.key, direction: sort.direction, numericKeys: ['amount'] });
  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const ticket = ++uploadTicket.current; setBusy(true); setError(''); setNotice('');
    try {
      const imported = await readCsvFile(file, schema);
      if (ticket !== uploadTicket.current) return;
      save(imported.map(row => ({ ...Object.fromEntries(columns.map(c => [c.key, row[c.key]])), id: crypto.randomUUID() })));
      setCategory(''); setQuery(''); setDraft(blank); setEditing(null); setNotice(`${imported.length}행을 불러왔습니다.`);
    } catch (err) { if (ticket === uploadTicket.current) setError(err.message); }
    finally { if (ticket === uploadTicket.current) { setBusy(false); e.target.value = ''; } }
  }
  function submit(e) {
    e.preventDefault(); const issues = validateRow(draft); setError(issues.join(', ')); if (issues.length) return;
    const normalized = Object.fromEntries(Object.entries(draft).map(([k,v]) => [k, v.trim()]));
    save(editing ? rows.map(r => r.id === editing ? { ...r, ...normalized } : r) : [...rows, { ...normalized, id: crypto.randomUUID() }]);
    setEditing(null); setDraft(blank); setNotice('행을 저장했습니다.');
  }
  return <><p className="eyebrow">03 / PRACTICE</p><h1>CSV를 한눈에.</h1><p className="lead">업로드한 데이터를 살펴보고, 필요한 결과만 내보내세요.</p>
    <section className="card"><div className="section-heading"><h2>데이터 가져오기</h2><a href="/samples/sales.csv" download>샘플 CSV ↓</a></div><p>UTF-8 · 최대 2MB / 10,000행 · 필수 열: name, category, amount</p><label className="upload">CSV 파일 선택<input aria-label="CSV 파일" type="file" accept=".csv,text/csv" disabled={busy} onChange={upload}/></label><p className="muted">성공하면 기존 목록을 교체합니다. 오류가 있으면 기존 데이터를 유지합니다.</p><ErrorMessage>{error || storageError}</ErrorMessage><p role="status">{busy ? '파일을 확인하고 있습니다…' : notice}</p></section>
    <div className="metrics"><section><span>전체 행</span><strong>{rows.length}</strong></section><section><span>검색 결과</span><strong>{visible.length}</strong></section><section><span>결과 금액 합계</span><strong>{visible.reduce((sum, r) => sum + Number(r.amount), 0).toLocaleString('ko')}</strong></section></div>
    <section className="card"><h2>{editing ? '행 수정' : '행 추가'}</h2><form className="row-form" onSubmit={submit}>{columns.map(c => <label key={c.key}>{c.label}<input aria-label={`행 ${c.label}`} value={draft[c.key]} onChange={e => setDraft({ ...draft, [c.key]: e.target.value })}/></label>)}<button disabled={busy}>{editing ? '행 저장' : '행 추가'}</button>{editing && <button className="secondary" type="button" onClick={() => { setDraft(blank); setEditing(null); }}>취소</button>}</form></section>
    <section className="card"><div className="section-heading"><h2>데이터 목록</h2><button className="secondary" disabled={!visible.length} onClick={() => downloadCsv(visible, columns)}>CSV 다운로드</button></div>
      <div className="toolbar"><label>검색<input aria-label="데이터 검색" value={query} onChange={e => setQuery(e.target.value)} placeholder="이름, 분류, 금액 검색"/></label><label>분류<select aria-label="분류 필터" value={category} onChange={e => setCategory(e.target.value)}><option value="">전체</option>{[...new Set(rows.map(r => r.category))].sort().map(c => <option key={c}>{c}</option>)}</select></label></div>
      <DataTable rows={visible} columns={columns} sortKey={sort.key} direction={sort.direction} onSort={key => setSort({ key, direction: sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc' })} renderActions={row => <div className="actions"><button className="secondary" disabled={busy} onClick={() => { setEditing(row.id); setDraft(Object.fromEntries(columns.map(c => [c.key, row[c.key]]))); }}>수정</button><button className="danger" disabled={busy} onClick={() => { save(rows.filter(r => r.id !== row.id)); if (editing === row.id) { setEditing(null); setDraft(blank); } }}>삭제</button></div>} />
    </section></>;
}
