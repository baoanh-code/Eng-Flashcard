import { Link } from 'react-router'

export function TopicVocabularyPreview({ levelId, records, topicId }) {
  return <section className="section-stack topic-vocabulary-preview" aria-labelledby="preview-title"><div className="section-heading"><h2 id="preview-title">Từ trong chủ đề</h2><Link to={`/vocabulary?level=${levelId}&topic=${topicId}`}>Xem tất cả</Link></div><ul className="word-preview">{records.slice(0, 5).map((record) => <li key={record.id}><strong>{record.term}</strong><span>{record.definition}</span></li>)}</ul></section>
}
