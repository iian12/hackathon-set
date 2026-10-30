import { useState } from 'react';

export function useLocalStorage(key, initial, validate = Array.isArray) {
  const [loaded] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return { value: initial, error: '' };
      const value = JSON.parse(raw);
      if (!validate(value)) throw new Error('invalid saved data');
      return { value, error: '' };
    } catch { return { value: initial, error: '저장 데이터를 읽을 수 없어 빈 상태로 시작합니다.' }; }
  });
  const [value, setValue] = useState(loaded.value);
  const [error, setError] = useState(loaded.error);
  function save(nextValue) {
    try { localStorage.setItem(key, JSON.stringify(nextValue)); setError(''); }
    catch { setError('저장에 실패했습니다. 새로고침하면 변경 내용이 사라질 수 있습니다.'); }
    setValue(nextValue);
  }
  return [value, save, error];
}
