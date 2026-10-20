import { Breadcrumbs } from '../../components/layout/Breadcrumbs.jsx'
import { useProgress } from '../progress/useProgress.js'
import { calculateTopicProgress } from '../topics/calculateTopicProgress.js'
import { ModeSwitcher } from './ModeSwitcher.jsx'

export function StudyLayout({ catalog, children, levelId, records, topic, topicId }) {
  const { state } = useProgress()
  const progress = calculateTopicProgress(catalog, topicId, levelId, state)
  return <div className="study-page"><Breadcrumbs items={[{ label: 'Chủ đề', to: `/levels/${levelId}/topics` }, { label: topic.name, to: `/levels/${levelId}/topics/${topicId}` }, { label: 'Học' }]} /><div className="study-session-summary" aria-label="Tiến độ chủ đề"><span><strong>{progress.learned}</strong> đã học</span><span><strong>{progress.review}</strong> cần ôn lại</span></div><header className="study-heading"><div className="study-heading__copy"><p className="study-context">CHỦ ĐỀ · {records.length} TỪ</p><h1 tabIndex="-1">{topic.name}</h1><p>{topic.description}</p></div><ModeSwitcher levelId={levelId} topicId={topicId} /></header><div className="study-workspace">{children}</div></div>
}
