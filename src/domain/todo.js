export const TODO_STORAGE_KEY = 'cofa.practice.todos.v1';
export const validateTodoText = text => text.trim() ? '' : '할 일을 입력하세요.';
export const validTodos = rows => Array.isArray(rows) && rows.every(r => typeof r.id === 'string' && typeof r.text === 'string' && typeof r.done === 'boolean') && new Set(rows.map(r => r.id)).size === rows.length;
