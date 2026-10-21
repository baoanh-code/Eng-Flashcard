import { useCallback, useMemo, useReducer } from 'react'
import { SessionProgress } from '../study/SessionProgress.jsx'
import { SessionSummary } from '../study/SessionSummary.jsx'
import { useStudyKeyboard } from '../study/useStudyKeyboard.js'
import { createFlashcardSession } from './createFlashcardSession.js'
import { Flashcard } from './Flashcard.jsx'
import { FlashcardControls } from './FlashcardControls.jsx'
import { flashcardReducer } from './flashcardReducer.js'
import { StudyOrderControl } from './StudyOrderControl.jsx'

export function FlashcardMode({ levelId, onClassify, onOrderChange, order, records, removeLearnedCards = false, topicId }) {
  const [session, dispatch] = useReducer(flashcardReducer, null, () => createFlashcardSession(records, order))
  const record = session.records[session.index]
  const restart = () => window.location.reload()
  const previous = useCallback(() => dispatch({ type: 'previous' }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const flip = useCallback(() => dispatch({ type: 'flip' }), [])
  const handlers = useMemo(() => ({ ' ': flip, ArrowLeft: previous, ArrowRight: next }), [flip, next, previous])
  useStudyKeyboard(handlers)
  if (session.complete) {
    const values = Object.values(session.classifications)
    return <SessionSummary levelId={levelId} topicId={topicId} onRestart={restart}><p>Đã phân loại {values.length} từ: {values.filter((value) => value === 'learned').length} đã học, {values.filter((value) => value === 'review').length} cần ôn.</p></SessionSummary>
  }
  const classification = session.classifications[record.id]
  function classify(status) {
    dispatch({ type: 'classify', id: record.id, status })
    if (removeLearnedCards && status === 'learned') dispatch({ type: 'remove', id: record.id })
    onClassify(record.id, status)
  }
  function changeOrder(value) {
    onOrderChange(value)
    dispatch({ type: 'reset', session: createFlashcardSession(records, value) })
  }
  return <div className="mode-stack"><div className="session-toolbar"><SessionProgress current={session.index + 1} total={session.records.length} /><StudyOrderControl value={order} onChange={changeOrder} /></div><Flashcard record={record} flipped={session.flipped} onFlip={flip} /><FlashcardControls classification={classification} disablePrevious={session.index === 0} onPrevious={previous} onNext={next} onLearned={() => classify('learned')} onReview={() => classify('review')} /><p className="keyboard-hint">Phím tắt: Space lật thẻ · ← trước · → tiếp</p></div>
}
