import { useState } from 'react';
import { useLocalStorage } from '../shared/useLocalStorage.js';
import { EmptyState, ErrorMessage } from '../shared/Feedback.jsx';
import { TODO_STORAGE_KEY, validTodos, validateTodoText } from '../domain/todo.js';

export function Todo() {
  const [items, save, storageError] = useLocalStorage(TODO_STORAGE_KEY, [], validTodos);
  const [text, setText] = useState(''), [editing, setEditing] = useState(null), [error, setError] = useState(''), [filter, setFilter] = useState('all');
  function submit(e) {
    e.preventDefault(); const issue = validateTodoText(text); setError(issue); if (issue) return;
    save(editing ? items.map(i => i.id === editing ? { ...i, text: text.trim() } : i) : [...items, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setText(''); setEditing(null);
  }
  const visible = items.filter(i => filter === 'all' || (filter === 'done' ? i.done : !i.done));
  return <><p className="eyebrow">02 / PRACTICE</p><h1>할 일을 정리하세요.</h1><p className="lead">추가부터 새로고침까지, 상태가 이어지는 작은 연습.</p>
    <section className="card"><h2>{editing ? '할 일 수정' : '새 할 일'}</h2><form onSubmit={submit}><label htmlFor="todo-text">할 일</label><div className="input-row"><input id="todo-text" value={text} onChange={e => setText(e.target.value)} placeholder="다음으로 할 일은?"/><button>{editing ? '저장' : '추가'}</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setText(''); setError(''); }}>취소</button>}</div></form><ErrorMessage>{error || storageError}</ErrorMessage></section>
    <section className="card"><div className="section-heading"><h2>할 일 목록 <span className="count">{items.length}</span></h2><label>상태 필터 <select aria-label="상태 필터" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">전체</option><option value="active">미완료</option><option value="done">완료</option></select></label></div>
      {!visible.length ? <EmptyState>표시할 할 일이 없습니다.</EmptyState> : <ul className="todo-list">{visible.map(item => <li key={item.id}><label className={item.done ? 'done' : ''}><input type="checkbox" checked={item.done} onChange={() => save(items.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}/>{item.text}</label><div className="actions"><button className="secondary" onClick={() => { setEditing(item.id); setText(item.text); setError(''); }}>수정</button><button className="danger" onClick={() => { save(items.filter(i => i.id !== item.id)); if (editing === item.id) { setEditing(null); setText(''); } }}>삭제</button></div></li>)}</ul>}
    </section></>;
}
