import { useState } from 'react';

// Replace this component with the actual exam requirements. No practice data here.
export function Starter() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  return <>
    <p className="eyebrow">01 / STARTER</p><h1>작게 만들고,<br/>직접 확인하기.</h1>
    <p className="lead">시험 요구사항을 여기에 구현하세요. 아래 입력은 브라우저 연결을 확인하는 최소 기능입니다.</p>
    <section className="card"><div className="section-heading"><h2>연결 확인</h2><span className="badge">READY</span></div>
      <form onSubmit={e => { e.preventDefault(); setMessage(value.trim() ? `확인: ${value.trim()}` : '내용을 입력하세요.'); }}>
        <label htmlFor="smoke-input">확인할 내용</label><div className="input-row"><input id="smoke-input" value={value} onChange={e => setValue(e.target.value)} placeholder="예: 브라우저 연결 완료"/><button>확인</button></div>
      </form><p role="status">{message || '입력 후 확인을 눌러 보세요.'}</p>
    </section>
    <div className="feature-grid"><section className="card"><p className="eyebrow">REUSE</p><h2>공통 도구</h2><p>CSV 읽기·검증·내보내기, 데이터 표, 로컬 저장을 가져와 사용하세요.</p><code>src/shared/</code></section><section className="card"><p className="eyebrow">PRACTICE</p><h2>완성 예제</h2><p>상태 변경과 파일 처리를 연습한 뒤, 본시험의 요구사항에 맞춰 구현하세요.</p><a href="/practice/todo">To-Do 열기 →</a></section></div>
  </>;
}
