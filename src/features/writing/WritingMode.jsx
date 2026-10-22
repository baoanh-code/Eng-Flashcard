import { ArrowRight } from 'lucide-react'
import { useReducer } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { SessionProgress } from '../study/SessionProgress.jsx'
import { SessionSummary } from '../study/SessionSummary.jsx'
import { StudyOrderControl } from '../study/StudyOrderControl.jsx'
import { createWritingSession } from './createWritingSession.js'
import { WritingAnswerForm } from './WritingAnswerForm.jsx'
import { WritingFeedback } from './WritingFeedback.jsx'
import { writingReducer } from './writingReducer.js'

export function WritingMode({ levelId, onOrderChange, order, records, sessionRandom = Math.random, topicId }) {
  const [state, dispatch] = useReducer(writingReducer, null, () => createWritingSession(records, order, sessionRandom))
  const record = state.records[state.index]
  if (state.complete) return <SessionSummary levelId={levelId} topicId={topicId} onRestart={() => window.location.reload()}><p>Bạn viết đúng {state.correct}/{state.records.length} từ ({Math.round(state.correct / state.records.length * 100)}%).</p></SessionSummary>
  function resetSession(nextOrder) {
    dispatch({ type: 'reset', session: createWritingSession(records, nextOrder, sessionRandom) })
  }
  function changeOrder(value) {
    onOrderChange(value)
    resetSession(value)
  }
  return <div className="mode-stack"><div className="session-toolbar"><SessionProgress current={state.index + 1} total={state.records.length} /><StudyOrderControl value={order} onChange={changeOrder} onReshuffle={() => resetSession('random')} /></div><section className="question-card writing-exercise"><p className="exercise-label">Viết từ tiếng Anh</p><h2>{record.definition}</h2>{record.exampleTranslation ? <p className="prompt-support">{record.exampleTranslation}</p> : null}<WritingAnswerForm key={record.id} disabled={state.answered} onSubmit={(answer) => dispatch({ type: 'answer', answer, term: record.term })} />{state.answered ? <WritingFeedback answer={state.answer} correct={state.wasCorrect} term={record.term} /> : null}</section>{state.answered ? <Button className="next-button" onClick={() => dispatch({ type: 'next' })}>Tiếp <ArrowRight aria-hidden="true" size={18} /></Button> : null}</div>
}
