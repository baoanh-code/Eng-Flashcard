import { Link } from 'react-router'
import { ProgressBar } from '../../components/ui/ProgressBar.jsx'

export function TopicProgressList({ items }) {
  return <ul className="topic-progress-list">{items.map(({ progress, topic }) => <li key={topic.id}><div><strong>{topic.name}</strong><Link to={`/levels/${topic.level}/topics/${topic.id}`}>Mở chủ đề</Link></div><ProgressBar label="Đã học" value={progress.learned} max={progress.total} valueText={`${progress.learned}/${progress.total} · ${progress.percentage}%`} /></li>)}</ul>
}
