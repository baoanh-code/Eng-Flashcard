import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { useProgress } from './useProgress.js'

export function ResetAllDialog() {
  const [open, setOpen] = useState(false)
  const { dispatch } = useProgress()
  return <><Button onClick={() => setOpen(true)} variant="ghost">Xóa toàn bộ tiến độ</Button><ConfirmDialog open={open} title="Xóa toàn bộ tiến độ?" description="Tất cả trạng thái học và phiên gần nhất trên thiết bị này sẽ bị xóa. Dữ liệu từ vựng không bị ảnh hưởng." confirmLabel="Xóa tiến độ" onCancel={() => setOpen(false)} onConfirm={() => { dispatch({ type: 'resetAll' }); setOpen(false) }} /></>
}
