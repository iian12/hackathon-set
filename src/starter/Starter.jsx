import { useState } from 'react';

// Replace this component with the actual exam requirements.
export function Starter() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  return <>
    <p className="eyebrow">STARTER</p><h1>시험 시작 템플릿</h1>
    <p className="lead">시험 요구사항을 여기에 구현하세요. 아래 입력은 브라우저 연결을 확인하는 최소 기능입니다.</p>
    <section className="card"><div className="section-heading"><h2>연결 확인</h2><span className="badge">READY</span></div>
      <form onSubmit={e => { e.preventDefault(); setMessage(value.trim() ? `확인: ${value.trim()}` : '내용을 입력하세요.'); }}>
        <label htmlFor="smoke-input">확인할 내용</label><div className="input-row"><input id="smoke-input" value={value} onChange={e => setValue(e.target.value)} placeholder="예: 브라우저 연결 완료"/><button>확인</button></div>
      </form><p role="status">{message || '입력 후 확인을 눌러 보세요.'}</p>
    </section>
  </>;
}
