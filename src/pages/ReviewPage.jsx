import { useSearchParams, useParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { Breadcrumbs } from '../components/layout/Breadcrumbs.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { selectReviewRecords } from '../features/progress/progressSelectors.js'
import { useProgress } from '../features/progress/useProgress.js'
import { ReviewEmptyState } from '../features/review/ReviewEmptyState.jsx'
import { ReviewFlashcards } from '../features/review/ReviewFlashcards.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function ReviewPage() {
  const { levelId } = useParams()
  const [params] = useSearchParams()
  const { catalog, status } = useCatalog(levelId)
  const { dispatch, state } = useProgress()
  usePageMeta('Ôn tập')
  if (levelId !== 'general') return <NotFoundPage />
  if (status === 'idle' || status === 'loading') return <p>Đang tải…</p>
  if (status === 'error') return <CatalogError />
  const topicId = params.get('topic')
  const base = topicId ? catalog?.indexes.byTopic.get(`${levelId}:${topicId}`) ?? [] : catalog?.indexes.byLevel.get(levelId) ?? []
  const records = selectReviewRecords(base, state)
  if (!records.length) return <ReviewEmptyState />
  return <div className="study-page review-page"><Breadcrumbs items={[{ label: 'Chủ đề', to: `/levels/${levelId}/topics` }, { label: 'Ôn tập' }]} /><header className="study-heading"><div><p className="study-context">{records.length} từ trong hàng đợi</p><h1 tabIndex="-1">Ôn tập</h1></div></header><div className="study-workspace"><ReviewFlashcards records={records} order={state.settings.studyOrderByMode.flashcards} levelId={levelId} topicId={topicId ?? records[0].topicId} onOrderChange={(studyOrder) => dispatch({ type: 'setStudyOrder', mode: 'flashcards', studyOrder })} onClassify={(id, classification) => dispatch({ type: classification === 'learned' ? 'markLearned' : 'markReview', id })} /></div></div>
}
