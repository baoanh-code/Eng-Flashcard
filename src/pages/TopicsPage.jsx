import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { CatalogLoading } from '../components/feedback/CatalogLoading.jsx'
import { NoVocabulary } from '../components/feedback/NoVocabulary.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { selectProgressForRecords } from '../features/progress/progressSelectors.js'
import { useProgress } from '../features/progress/useProgress.js'
import { TopicList } from '../features/topics/TopicList.jsx'
import { TopicSearch } from '../features/topics/TopicSearch.jsx'
import { calculateTopicProgress } from '../features/topics/calculateTopicProgress.js'
import { sortTopicsByProgress } from '../features/topics/sortTopicsByProgress.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function TopicsPage() {
  const { levelId } = useParams()
  const { catalog, status } = useCatalog(levelId)
  const { state } = useProgress()
  const [query, setQuery] = useState('')
  usePageMeta(levelId === 'general' ? 'Chủ đề từ vựng' : 'Không tìm thấy')
  const topics = useMemo(() => catalog?.topics.filter((topic) => topic.level === levelId && `${topic.name} ${topic.description}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) ?? [], [catalog, levelId, query])
  const sortedTopics = useMemo(() => sortTopicsByProgress(topics, (topic) => calculateTopicProgress(catalog, topic.id, levelId, state)), [catalog, levelId, state, topics])
  if (levelId !== 'general') return <NotFoundPage />
  if (status === 'idle' || status === 'loading') return <CatalogLoading />
  if (status === 'error' || !catalog) return <CatalogError />
  if (status === 'empty') return <NoVocabulary title="Chưa có chủ đề từ vựng" />
  const overall = selectProgressForRecords(catalog.indexes.byLevel.get(levelId) ?? [], state)
  return <div className="page-stack topics-page"><header className="page-heading topics-heading"><div><p className="eyebrow">{catalog.topics.length} CHỦ ĐỀ TỪ VỰNG</p><h1 tabIndex="-1">Hôm nay bạn muốn nói về điều gì?</h1><p>Mỗi chủ đề là một nhóm từ gần với đời sống và giao tiếp hằng ngày.</p></div><div className="compact-progress"><ProgressBar label="Tiến độ từ vựng" value={overall.learned} max={overall.total} valueText={`${overall.percentage}%`} /></div></header><div className="topics-tools"><TopicSearch value={query} onChange={setQuery} /></div>{sortedTopics.length ? <TopicList topics={sortedTopics} getProgress={(topic) => calculateTopicProgress(catalog, topic.id, levelId, state)} /> : <EmptyState icon={SearchX} title="Không tìm thấy chủ đề" description="Thử một từ khóa ngắn hơn hoặc xóa nội dung tìm kiếm." />}</div>
}
