import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'

export function CatalogError() {
  return <EmptyState titleAs="h1" icon={AlertTriangle} title="Không thể tải từ vựng" description="Dữ liệu chưa tải được. Hãy thử làm mới trang." action={<Button onClick={() => window.location.reload()}><RotateCcw aria-hidden="true" size={18} />Thử lại</Button>} />
}
