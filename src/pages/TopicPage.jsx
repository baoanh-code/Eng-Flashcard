import { Link, useParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { Breadcrumbs } from '../components/layout/Breadcrumbs.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { ResetTopicDialog } from '../features/progress/ResetTopicDialog.jsx'
import { useProgress } from '../features/progress/useProgress.js'
import { StudyModeLinks } from '../features/topics/StudyModeLinks.jsx'
import { TopicVocabularyPreview } from '../features/topics/TopicVocabularyPreview.jsx'
import { calculateTopicProgress } from '../features/topics/calculateTopicProgress.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function TopicPage() {
  const { levelId, topicId } = useParams()
  const { catalog, status } = useCatalog(levelId)
  const { state } = useProgress()
  const topic = catalog?.topics.find((item) => item.level === levelId && item.id === topicId)
  usePageMeta(topic?.name ?? 'Chủ đề')
  if (status === 'idle' || status === 'loading') return <p>Đang tải…</p>
  if (status === 'error') return <CatalogError />
  if (!topic || !catalog) return <NotFoundPage />
  const records = catalog.indexes.byTopic.get(`${levelId}:${topicId}`) ?? []
  const progress = calculateTopicProgress(catalog, topicId, levelId, state)
  return <div className="page-stack topic-page"><Breadcrumbs items={[{ label: 'Chủ đề', to: `/levels/${levelId}/topics` }, { label: topic.name }]} /><header className="topic-header"><div><p className="eyebrow">CHỦ ĐỀ · {records.length} từ</p><h1 tabIndex="-1">{topic.name}</h1><p>{topic.description}</p></div><div className="topic-progress"><ProgressBar label="Đã học" max={progress.total} value={progress.learned} valueText={`${progress.learned}/${progress.total} · ${progress.percentage}%`} /><div className="status-counts"><span>{progress.review} cần ôn</span><span>{progress.notStudied} chưa học</span></div></div></header><section className="topic-modes" aria-labelledby="choose-mode"><div className="section-heading section-heading--editorial"><h2 id="choose-mode">Chọn cách học</h2><p>Bắt đầu ngay, không cần thiết lập.</p></div><StudyModeLinks levelId={levelId} topicId={topicId} />{progress.review ? <Link className="inline-link" to={`/levels/${levelId}/review?topic=${topicId}`}>Ôn {progress.review} từ cần xem lại</Link> : null}</section><TopicVocabularyPreview levelId={levelId} topicId={topicId} records={records} /><div className="secondary-actions"><ResetTopicDialog ids={records.map((record) => record.id)} levelId={levelId} topicId={topicId} topicName={topic.name} /></div></div>
}
