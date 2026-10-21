import { Link } from 'react-router'

export function TopicCard({ index, progress, topic }) {
  const number = String(index).padStart(2, '0')
  return <article className="topic-card"><Link className="topic-card__main" to={`/levels/${topic.level}/topics/${topic.id}`}><span className="sr-only">Mở chủ đề: </span><span className="topic-card__number" aria-hidden="true">{number}</span><span className="topic-card__label">TOPIC {number}</span><h2>{topic.name}</h2><span className="topic-card__count">{progress.total} từ{progress.learned ? ` · ${progress.learned} đã học` : ''}</span><span className="topic-card__arrow" aria-hidden="true">→</span></Link></article>
}
