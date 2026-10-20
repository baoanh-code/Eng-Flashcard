import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { useProgress } from './useProgress.js'

export function ResetTopicDialog({ ids, levelId, topicId, topicName }) {
  const [open, setOpen] = useState(false)
  const { dispatch } = useProgress()
  return <><Button onClick={() => setOpen(true)} variant="ghost">Đặt lại chủ đề</Button><ConfirmDialog open={open} title={`Đặt lại ${topicName}?`} description="Trạng thái Đã học và Cần ôn của chủ đề này sẽ bị xóa trên thiết bị này." confirmLabel="Đặt lại chủ đề" onCancel={() => setOpen(false)} onConfirm={() => { dispatch({ type: 'resetTopic', ids, levelId, topicId }); setOpen(false) }} /></>
}
