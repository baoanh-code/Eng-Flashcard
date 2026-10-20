import { useParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { ProgressSummary } from '../features/progress/ProgressSummary.jsx'
import { ResetAllDialog } from '../features/progress/ResetAllDialog.jsx'
import { selectProgressForRecords } from '../features/progress/progressSelectors.js'
import { TopicProgressList } from '../features/progress/TopicProgressList.jsx'
import { useProgress } from '../features/progress/useProgress.js'
import { calculateTopicProgress } from '../features/topics/calculateTopicProgress.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function ProgressPage() {
  const { levelId } = useParams()
  const { catalog, status } = useCatalog(levelId)
  const { state } = useProgress()
  usePageMeta('Tiến độ')
  if (levelId !== 'general') return <NotFoundPage />
  if (status === 'idle' || status === 'loading') return <p>Đang tải…</p>
  if (status === 'error') return <CatalogError />
  const overall = selectProgressForRecords(catalog?.indexes.byLevel.get(levelId) ?? [], state)
  const items = (catalog?.topics ?? []).map((topic) => ({ topic, progress: calculateTopicProgress(catalog, topic.id, levelId, state) }))
  return <div className="page-stack progress-page"><header className="page-heading"><div><p className="eyebrow">TIẾN ĐỘ TRÊN THIẾT BỊ NÀY</p><h1 tabIndex="-1">Tiến độ từ vựng</h1><p>Một cái nhìn ngắn gọn về những từ bạn đã nhớ.</p></div></header><ProgressSummary progress={overall} /><section className="section-stack" aria-labelledby="topic-progress-title"><div className="section-heading"><h2 id="topic-progress-title">Theo chủ đề</h2></div><TopicProgressList items={items} /></section><div className="danger-zone"><h2>Bắt đầu lại</h2><p>Xóa toàn bộ trạng thái đã học và cần ôn trên thiết bị này.</p><ResetAllDialog /></div></div>
}
