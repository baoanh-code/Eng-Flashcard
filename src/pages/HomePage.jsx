import { ArrowDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { CatalogError } from '../components/feedback/CatalogError.jsx'
import { CatalogLoading } from '../components/feedback/CatalogLoading.jsx'
import { NoVocabulary } from '../components/feedback/NoVocabulary.jsx'
import { useCatalog } from '../data/catalog/useCatalog.js'
import { selectContinueTarget, selectProgressForRecords } from '../features/progress/progressSelectors.js'
import { useProgress } from '../features/progress/useProgress.js'
import { StudyModeLinks } from '../features/topics/StudyModeLinks.jsx'
import { TopicList } from '../features/topics/TopicList.jsx'
import { calculateTopicProgress } from '../features/topics/calculateTopicProgress.js'
import { usePageMeta } from '../hooks/usePageMeta.js'

export function HomePage() {
  usePageMeta('Học từ vựng tiếng Anh theo chủ đề')
  const { catalog, status } = useCatalog('general')
  const { state } = useProgress()
  if (status === 'idle' || status === 'loading') return <CatalogLoading />
  if (status === 'error' || !catalog) return <CatalogError />
  if (status === 'empty') return <NoVocabulary title="Chưa có dữ liệu từ vựng" />
  const levelRecords = catalog.indexes.byLevel.get('general') ?? []
  const progress = selectProgressForRecords(levelRecords, state)
  const continueTarget = selectContinueTarget(state, catalog)
  const primaryTarget = continueTarget
    ? `/levels/${continueTarget.levelId}/topics/${continueTarget.topicId}/study/${continueTarget.mode}`
    : '#topic-library'
  return <div className="home-page"><section className="home-hero"><div className="home-intro"><p className="eyebrow">ENGLISH VOCABULARY · LEARN BY TOPIC</p><h1 tabIndex="-1">Từ vựng thực tế<br />cho mỗi ngày.</h1><p>Học những từ tiếng Anh thiết thực theo chủ đề, kèm nghĩa tiếng Việt và ví dụ ngắn dễ nhớ.</p><Link className="ui-button ui-button--primary ui-button--large" to={primaryTarget}>{continueTarget ? 'Học tiếp' : 'Bắt đầu học'} {continueTarget ? <ArrowRight aria-hidden="true" size={18} /> : <ArrowDown aria-hidden="true" size={18} />}</Link></div></section><dl className="home-facts" aria-label="Thông tin thư viện"><div><dt>Chủ đề</dt><dd>{catalog.topics.length}</dd></div><div><dt>Từ vựng</dt><dd>{levelRecords.length}</dd></div><div><dt>Phạm vi</dt><dd>Tổng hợp</dd></div><div><dt>Đã học</dt><dd>{progress.learned}/{progress.total}</dd></div></dl><section className="home-library" id="topic-library" aria-labelledby="topics-title"><div className="library-heading"><div><p className="section-index" aria-hidden="true">{String(catalog.topics.length).padStart(2, '0')}</p><p className="eyebrow">DANH MỤC CHỦ ĐỀ</p><h2 id="topics-title">Từ vựng theo chủ đề</h2></div><p>{levelRecords.length} từ thuộc {catalog.topics.length} chủ đề thông dụng</p></div><TopicList topics={catalog.topics} getProgress={(topic) => calculateTopicProgress(catalog, topic.id, topic.level, state)} /></section><section className="home-study-entry" aria-labelledby="quick-title"><div className="section-heading section-heading--editorial"><p className="eyebrow">BỐN CHẾ ĐỘ HỌC</p><h2 id="quick-title">Chọn cách bạn muốn luyện.</h2><p>Chọn chủ đề trước, rồi đổi chế độ bất cứ lúc nào trong phiên học.</p></div><StudyModeLinks /></section></div>
}
