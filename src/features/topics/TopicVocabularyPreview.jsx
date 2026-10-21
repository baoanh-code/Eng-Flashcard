export function TopicVocabularyPreview({ records }) {
  return (
    <section className="section-stack topic-vocabulary-preview" aria-labelledby="preview-title">
      <div className="section-heading">
        <h2 id="preview-title">Từ trong chủ đề</h2>
        <span>{records.length} từ</span>
      </div>
      <ul className="word-preview">
        {records.map((record) => <li key={record.id}><strong>{record.term}</strong><span>{record.definition}</span></li>)}
      </ul>
    </section>
  )
}
