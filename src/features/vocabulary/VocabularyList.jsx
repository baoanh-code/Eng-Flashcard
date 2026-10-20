import { VocabularyRow } from './VocabularyRow.jsx'

export function VocabularyList({ progress, records }) {
  return <ul className="vocabulary-list">{records.map((record) => <VocabularyRow key={record.id} record={record} progress={progress} />)}</ul>
}
