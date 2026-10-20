export function SessionProgress({ current, total }) {
  const currentLabel = String(current).padStart(3, '0')
  const totalLabel = String(total).padStart(3, '0')
  return <div className="session-progress"><span className="session-progress__label">Thẻ</span><span className="session-progress__value">{currentLabel} <span>/ {totalLabel}</span></span><span className="sr-only" role="progressbar" aria-label="Tiến độ phiên học" aria-valuemin="1" aria-valuemax={total} aria-valuenow={current}>{current}/{total}</span></div>
}
