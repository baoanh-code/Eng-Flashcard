import { Link } from 'react-router'
import { studyModes } from './studyModes.js'

export function StudyModeLinks({ levelId = 'general', topicId }) {
  const topicBase = topicId ? `/levels/${levelId}/topics/${topicId}/study` : `/levels/${levelId}/topics`
  return <div className="mode-grid">{studyModes.map(({ id, label, englishLabel, description, icon: Icon }) => <Link className="mode-link" key={id} to={topicId ? `${topicBase}/${id}` : topicBase}><Icon aria-hidden="true" size={18} strokeWidth={1.6} /><span className="mode-link__copy"><strong>{label}</strong><small>{englishLabel} · {description}</small></span><span className="mode-link__arrow" aria-hidden="true">→</span></Link>)}</div>
}
