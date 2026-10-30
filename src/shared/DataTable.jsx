import { EmptyState } from './Feedback.jsx';

// Parent owns search/filter/sort state and domain rules; rows must have stable IDs.
export function DataTable({ rows, columns, sortKey, direction, onSort, renderActions }) {
  if (!rows.length) return <EmptyState />;
  return <div className="table-scroll"><table><caption className="sr-only">데이터 목록</caption><thead><tr>{columns.map(c => <th key={c.key} scope="col" aria-sort={sortKey === c.key ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}><button className="sort-button" onClick={() => onSort(c.key)}>{c.label} {sortKey === c.key ? (direction === 'asc' ? '↑' : '↓') : '↕'}</button></th>)}{renderActions && <th scope="col">관리</th>}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}{renderActions && <td>{renderActions(row)}</td>}</tr>)}</tbody></table></div>;
}
