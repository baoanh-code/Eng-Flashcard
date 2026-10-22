import { ArrowRight } from 'lucide-react'
import { useMemo, useReducer } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { SessionProgress } from '../study/SessionProgress.jsx'
import { SessionSummary } from '../study/SessionSummary.jsx'
import { StudyOrderControl } from '../study/StudyOrderControl.jsx'
import { AnswerOption } from './AnswerOption.jsx'
import { createQuestion } from './createQuestion.js'
import { createQuizSession } from './createQuizSession.js'
import { quizReducer } from './quizReducer.js'

export function MultipleChoiceMode({ levelId, levelRecords = records, onOrderChange, order, records, sessionRandom = Math.random, topicId }) {
  const [state, dispatch] = useReducer(quizReducer, null, () => createQuizSession(records, order, sessionRandom))
  const record = state.records[state.index]
  const question = useMemo(() => createQuestion(record, records, levelRecords), [levelRecords, record, records])
  if (state.complete) return <SessionSummary levelId={levelId} topicId={topicId} onRestart={() => window.location.reload()}><p>Bạn trả lời đúng {state.correct}/{state.records.length} câu ({Math.round(state.correct / state.records.length * 100)}%).</p></SessionSummary>
  const answered = Boolean(state.selectedId)
  const wasCorrect = state.selectedId === record.id
  function resetSession(nextOrder) {
    dispatch({ type: 'reset', session: createQuizSession(records, nextOrder, sessionRandom) })
  }
  function changeOrder(value) {
    onOrderChange(value)
    resetSession(value)
  }
  return <div className="mode-stack"><div className="session-toolbar"><SessionProgress current={state.index + 1} total={state.records.length} /><StudyOrderControl value={order} onChange={changeOrder} onReshuffle={() => resetSession('random')} /></div><section className="question-card" aria-labelledby="quiz-prompt"><p className="exercise-label">Chọn nghĩa đúng</p><h2 id="quiz-prompt">{record.term}</h2>{record.ipa ? <p className="prompt-support">{record.ipa}</p> : null}<div className="answer-list">{question.options.map((option, index) => <AnswerOption key={option.id} index={index} option={option} answered={answered} isCorrect={option.id === record.id} isSelected={option.id === state.selectedId} onClick={() => dispatch({ type: 'answer', id: option.id, correctId: record.id })} />)}</div>{answered ? <div className={`feedback ${wasCorrect ? 'correct' : 'incorrect'}`} role="status"><strong>{wasCorrect ? 'Chính xác!' : 'Chưa đúng.'}</strong>{wasCorrect ? null : <span>Đáp án: {record.definition}</span>}</div> : null}</section>{answered ? <Button className="next-button" onClick={() => dispatch({ type: 'next' })}>Tiếp <ArrowRight aria-hidden="true" size={18} /></Button> : null}</div>
}
