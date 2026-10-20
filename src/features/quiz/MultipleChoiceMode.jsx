import { ArrowRight } from 'lucide-react'
import { useMemo, useReducer } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { SessionProgress } from '../study/SessionProgress.jsx'
import { SessionSummary } from '../study/SessionSummary.jsx'
import { AnswerOption } from './AnswerOption.jsx'
import { createQuestion } from './createQuestion.js'
import { quizReducer } from './quizReducer.js'

export function MultipleChoiceMode({ levelId, levelRecords = records, records, topicId }) {
  const [state, dispatch] = useReducer(quizReducer, { records, index: 0, selectedId: null, correct: 0, incorrect: 0, complete: false })
  const record = records[state.index]
  const question = useMemo(() => createQuestion(record, records, levelRecords), [levelRecords, record, records])
  if (state.complete) return <SessionSummary levelId={levelId} topicId={topicId} onRestart={() => window.location.reload()}><p>Bạn trả lời đúng {state.correct}/{records.length} câu ({Math.round(state.correct / records.length * 100)}%).</p></SessionSummary>
  const answered = Boolean(state.selectedId)
  const wasCorrect = state.selectedId === record.id
  return <div className="mode-stack"><SessionProgress current={state.index + 1} total={records.length} /><section className="question-card" aria-labelledby="quiz-prompt"><p className="exercise-label">Chọn nghĩa đúng</p><h2 id="quiz-prompt">{record.term}</h2>{record.ipa ? <p className="prompt-support">{record.ipa}</p> : null}<div className="answer-list">{question.options.map((option, index) => <AnswerOption key={option.id} index={index} option={option} answered={answered} isCorrect={option.id === record.id} isSelected={option.id === state.selectedId} onClick={() => dispatch({ type: 'answer', id: option.id, correctId: record.id })} />)}</div>{answered ? <div className={`feedback ${wasCorrect ? 'correct' : 'incorrect'}`} role="status"><strong>{wasCorrect ? 'Chính xác!' : 'Chưa đúng.'}</strong>{wasCorrect ? null : <span>Đáp án: {record.definition}</span>}</div> : null}</section>{answered ? <Button className="next-button" onClick={() => dispatch({ type: 'next' })}>Tiếp <ArrowRight aria-hidden="true" size={18} /></Button> : null}</div>
}
