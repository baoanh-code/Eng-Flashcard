import { CheckCircle2, XCircle } from 'lucide-react'

export function AnswerOption({ answered, index, isCorrect, isSelected, onClick, option }) {
  const state = answered && isCorrect ? 'correct' : answered && isSelected ? 'incorrect' : ''
  return <button className={`answer-option ${state}`} disabled={answered} onClick={onClick} type="button"><span className="answer-option__index" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="answer-option__text">{option.definition}</span>{state === 'correct' ? <span className="answer-option__state"><CheckCircle2 aria-hidden="true" size={18} />Đúng</span> : null}{state === 'incorrect' ? <span className="answer-option__state"><XCircle aria-hidden="true" size={18} />Bạn chọn</span> : null}</button>
}
