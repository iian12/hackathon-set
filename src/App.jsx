import { Todo } from './practice/Todo.jsx';
import { Dashboard } from './practice/Dashboard.jsx';
import { Starter } from './starter/Starter.jsx';

export function App() {
  const path = window.location.pathname;
  const page = path === '/practice/todo' ? 'todo' : path === '/practice/csv' ? 'csv' : 'starter';
  return <>
    <header className="site-header"><a className="brand" href="/">C<span> / </span>EXAM KIT</a><span className="tag">React · local workspace</span></header>
    <div className="layout">
      <aside><p className="eyebrow">WORKSPACE</p><nav aria-label="주 메뉴">
        <a href="/" aria-current={page === 'starter' ? 'page' : undefined}>01 <span>시작 템플릿</span></a>
        <p className="eyebrow practice-label">PRACTICE / 연습 예제</p>
        <a href="/practice/todo" aria-current={page === 'todo' ? 'page' : undefined}>02 <span>To-Do</span></a>
        <a href="/practice/csv" aria-current={page === 'csv' ? 'page' : undefined}>03 <span>CSV 대시보드</span></a>
      </nav><p className="aside-note">공통 도구는 src/shared<br/>문제별 규칙은 src/domain</p></aside>
      <main>{page === 'todo' ? <Todo /> : page === 'csv' ? <Dashboard /> : <Starter />}</main>
    </div>
    <footer><span>0.0.0.0:3000 · 포트 고정</span><details><summary>서버 확인</summary><code data-testid="server-id">{__SERVER_ID__}</code></details></footer>
  </>;
}
