import { AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react'

const icons = {
  error: AlertCircle,
  review: RefreshCcw,
  success: CheckCircle2,
}

export function StatusMessage({ children, tone = 'success', live = false }) {
  const Icon = icons[tone] ?? CheckCircle2
  return (
    <div className={`status-message status-message--${tone}`} role={live ? 'status' : undefined}>
      <Icon aria-hidden="true" size={20} />
      <div>{children}</div>
    </div>
  )
}
