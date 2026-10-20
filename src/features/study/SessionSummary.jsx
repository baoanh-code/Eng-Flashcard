import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button.jsx'

export function SessionSummary({ children, levelId, onRestart, title = 'Hoàn thành phiên học', topicId }) {
  return <section className="session-summary"><CheckCircle2 aria-hidden="true" size={36} /><h2>{title}</h2>{children}<div className="button-row"><Button onClick={onRestart}><RotateCcw aria-hidden="true" size={18} />Học lại</Button><Link className="ui-button ui-button--secondary" to={`/levels/${levelId}/topics/${topicId}`}>Về chủ đề</Link></div></section>
}
