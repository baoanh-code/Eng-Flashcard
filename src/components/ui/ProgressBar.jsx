export function ProgressBar({ label, max = 100, value, valueText }) {
  const safeMax = max > 0 ? max : 1
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const percentage = (safeValue / safeMax) * 100

  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span>{label}</span>
        <span>{valueText ?? `${Math.round(percentage)}%`}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin="0"
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        aria-valuetext={valueText}
      >
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
