export default function Pagination({
  page,
  totalPages,
  pageSize,
  onFirst,
  onPrev,
  onNext,
  onPageSize,
}) {
  return (
    <div className="pagination">
      <div className="muted">
        Page {page} of {totalPages || 1}
      </div>
      <div className="page-controls">
        <label className="page-size">
          <span>Page size</span>
          <select value={pageSize} onChange={(event) => onPageSize?.(event.target.value)}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button className="btn btn-ghost" onClick={onFirst} disabled={page <= 1}>
          First
        </button>
        <button className="btn btn-ghost" onClick={onPrev} disabled={page <= 1}>
          Prev
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
