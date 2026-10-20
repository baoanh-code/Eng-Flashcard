import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState.jsx'

export function ReviewEmptyState() {
  return <EmptyState titleAs="h1" icon={CheckCircle2} title="Không có từ cần ôn" description="Những từ bạn đánh dấu Cần ôn lại sẽ xuất hiện ở đây." action={<Link className="ui-button ui-button--primary" to="/levels/general/topics">Chọn chủ đề</Link>} />
}
