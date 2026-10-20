import { BookOpen } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '../ui/EmptyState.jsx'

export function NoVocabulary({ title = 'Chưa có từ vựng' }) {
  return <EmptyState titleAs="h1" icon={BookOpen} title={title} description="Chủ đề này chưa có dữ liệu hợp lệ. Bạn có thể chọn chủ đề khác." action={<Link className="ui-button ui-button--primary" to="/levels/general/topics">Xem chủ đề</Link>} />
}
