export function ErrorMessage({ children }) { return children ? <p className="error" role="alert">{children}</p> : null; }
export function EmptyState({ children = '결과가 없습니다.' }) { return <p className="empty" role="status">{children}</p>; }
