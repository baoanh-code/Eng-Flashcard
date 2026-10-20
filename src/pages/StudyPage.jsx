import { useEffect } from 'react'
import { useParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { NoVocabulary } from '../components/feedback/NoVocabulary.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { FlashcardMode } from '../features/flashcards/FlashcardMode.jsx'
import { MatchingMode } from '../features/matching/MatchingMode.jsx'
import { useProgress } from '../features/progress/useProgress.js'
import { MultipleChoiceMode } from '../features/quiz/MultipleChoiceMode.jsx'
import { StudyLayout } from '../features/study/StudyLayout.jsx'
import { studyModes } from '../features/topics/studyModes.js'
import { WritingMode } from '../features/writing/WritingMode.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function StudyPage() {
  const { levelId, mode, topicId } = useParams()
  const { catalog, status } = useCatalog(levelId)
  const { dispatch, state } = useProgress()
  const topic = catalog?.topics.find((item) => item.level === levelId && item.id === topicId)
  const records = catalog?.indexes.byTopic.get(`${levelId}:${topicId}`) ?? []
  usePageMeta(topic ? `${studyModes.find((item) => item.id === mode)?.label ?? 'Học'} · ${topic.name}` : 'Học')
  useEffect(() => {
    if (topic && studyModes.some((item) => item.id === mode)) dispatch({ type: 'updateLastSession', levelId, topicId, mode })
  }, [dispatch, levelId, mode, topic, topicId])
  if (status === 'idle' || status === 'loading') return <p>Đang tải…</p>
  if (status === 'error') return <CatalogError />
  if (!topic || !studyModes.some((item) => item.id === mode)) return <NotFoundPage />
  if (!records.length) return <NoVocabulary />
  const modeProps = { levelId, topicId, records, levelRecords: catalog.indexes.byLevel.get(levelId) ?? records }
  return <StudyLayout catalog={catalog} levelId={levelId} records={records} topicId={topicId} topic={topic}>{mode === 'flashcards' ? <FlashcardMode {...modeProps} order={state.settings.studyOrder} onOrderChange={(studyOrder) => dispatch({ type: 'setStudyOrder', studyOrder })} onClassify={(id, classification) => dispatch({ type: classification === 'learned' ? 'markLearned' : 'markReview', id })} /> : mode === 'multiple-choice' ? <MultipleChoiceMode {...modeProps} /> : mode === 'writing' ? <WritingMode {...modeProps} /> : <MatchingMode {...modeProps} />}</StudyLayout>
}
