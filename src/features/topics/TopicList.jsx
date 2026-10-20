import { TopicCard } from './TopicCard.jsx'

export function TopicList({ getProgress, topics }) {
  return <div className="topic-grid">{topics.map((topic, index) => <TopicCard index={index + 1} key={topic.id} topic={topic} progress={getProgress(topic)} />)}</div>
}
