export function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Math.round(Number(value) || 0)))}%`
}
