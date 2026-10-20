import { CheckCircle2, Circle, Flag } from 'lucide-react'
import { getRecordStatus } from '../progress/progressSelectors.js'

const statusConfig = { learned: { label: 'Đã học', icon: CheckCircle2 }, review: { label: 'Cần ôn', icon: Flag }, 'not-studied': { label: 'Chưa học', icon: Circle } }

export function VocabularyRow({ progress, record }) {
  const status = getRecordStatus(record.id, progress)
  const config = statusConfig[status]
  const Icon = config.icon
  return <li className="vocabulary-row"><div className="vocabulary-pair"><strong>{record.term}</strong><span>{record.definition}</span>{record.ipa || record.partOfSpeech ? <small>{[record.ipa, record.partOfSpeech].filter(Boolean).join(' · ')}</small> : null}</div><div className="vocabulary-meta"><span className="topic-label">{record.topic}</span><span className={`status-badge ${status}`}><Icon aria-hidden="true" size={14} />{config.label}</span></div>{record.example ? <details><summary>Đọc ví dụ</summary><div className="vocabulary-example"><p>{record.example}</p>{record.exampleTranslation ? <p>{record.exampleTranslation}</p> : null}</div></details> : null}</li>
}
