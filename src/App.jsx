import { Starter } from './starter/Starter.jsx';

export function App() {
  return <>
    <header className="site-header">
      <a className="brand" href="/">COFA / EXAM KIT</a>
      <span className="tag">React</span>
    </header>
    <main><Starter /></main>
    <footer>
      <span>0.0.0.0:3000 · 포트 고정</span>
      <details><summary>서버 확인</summary><code data-testid="server-id">{__SERVER_ID__}</code></details>
    </footer>
  </>;
}
