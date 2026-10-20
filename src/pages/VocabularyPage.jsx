import { SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { CatalogLoading } from '../components/feedback/CatalogLoading.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { useProgress } from '../features/progress/useProgress.js'
import { ExportMenu } from '../features/vocabulary/ExportMenu.jsx'
import { filterVocabulary } from '../features/vocabulary/filterVocabulary.js'
import { VocabularyFilters } from '../features/vocabulary/VocabularyFilters.jsx'
import { VocabularyList } from '../features/vocabulary/VocabularyList.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

const validStatuses = new Set(['all', 'learned', 'review', 'not-studied'])
const emptySearchIndex = new Map()

export function VocabularyPage() {
  usePageMeta('Từ vựng')
  const [params, setParams] = useSearchParams()
  const level = params.get('level') === 'general' ? 'general' : 'general'
  const { catalog, status } = useCatalog(level)
  const { state } = useProgress()
  const topicParam = params.get('topic') ?? 'all'
  const topic = catalog?.topics.some((item) => item.id === topicParam) ? topicParam : 'all'
  const statusParam = params.get('status') ?? 'all'
  const filterStatus = validStatuses.has(statusParam) ? statusParam : 'all'
  const query = params.get('q') ?? ''
  const records = useMemo(() => filterVocabulary(catalog?.records ?? [], { level, topic, status: filterStatus, query }, state, catalog?.indexes.searchIndex ?? emptySearchIndex), [catalog, filterStatus, level, query, state, topic])
  if (status === 'idle' || status === 'loading') return <CatalogLoading />
  if (status === 'error') return <CatalogError />
  function change(key, value) { const next = new URLSearchParams(params); const name = key === 'query' ? 'q' : key; if (!value || value === 'all') next.delete(name); else next.set(name, value); next.set('level', level); setParams(next) }
  return <div className="page-stack vocabulary-page"><header className="page-heading"><div><h1 tabIndex="-1">Thư viện từ vựng</h1><p>Tìm theo từ, nghĩa, chủ đề hoặc trạng thái học.</p></div><ExportMenu levelId={level} topicId={topic === 'all' ? null : topic} records={records} /></header><VocabularyFilters filters={{ topic, status: filterStatus, query }} topics={catalog?.topics ?? []} onChange={change} /><p className="result-count" aria-live="polite">{records.length} kết quả</p>{records.length ? <VocabularyList records={records} progress={state} /> : <EmptyState icon={SearchX} title="Không tìm thấy từ" description="Hãy thử thay đổi từ khóa hoặc bộ lọc." />}</div>
}
