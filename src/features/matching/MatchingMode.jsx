import { ArrowRight } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { SessionProgress } from '../study/SessionProgress.jsx'
import { SessionSummary } from '../study/SessionSummary.jsx'
import { StudyOrderControl } from '../study/StudyOrderControl.jsx'
import { createMatchingRounds } from './createMatchingRounds.js'
import { MatchingBoard } from './MatchingBoard.jsx'
import { matchingReducer } from './matchingReducer.js'

function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` }

export function MatchingMode({ levelId, onOrderChange, order, records, sessionRandom = Math.random, topicId }) {
  const [rounds, setRounds] = useState(() => createMatchingRounds(records, 6, sessionRandom, order))
  const [initialStartedAt] = useState(() => Date.now())
  const [state, dispatch] = useReducer(matchingReducer, { roundIndex: 0, matchedIds: [], selectedTermId: null, selectedDefinitionId: null, mismatch: null, mistakes: 0, startedAt: initialStartedAt })
  const [elapsed, setElapsed] = useState(0)
  const round = rounds[state.roundIndex]
  const roundComplete = round && state.matchedIds.length === round.pairs.length
  const allComplete = roundComplete && state.roundIndex === rounds.length - 1
  useEffect(() => { if (state.mismatch) { const timer = window.setTimeout(() => dispatch({ type: 'clearMismatch' }), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 700); return () => window.clearTimeout(timer) } }, [state.mismatch])
  useEffect(() => { if (roundComplete) return undefined; const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - state.startedAt) / 1000)), 1000); return () => window.clearInterval(timer) }, [roundComplete, state.startedAt])
  if (allComplete) return <SessionSummary levelId={levelId} topicId={topicId} onRestart={() => window.location.reload()}><p>Đã ghép {records.length} cặp với {state.mistakes} lần chưa khớp.</p></SessionSummary>
  function resetSession(nextOrder) {
    setRounds(createMatchingRounds(records, 6, sessionRandom, nextOrder))
    setElapsed(0)
    dispatch({ type: 'reset', startedAt: Date.now() })
  }
  function changeOrder(value) {
    onOrderChange(value)
    resetSession(value)
  }
  return <div className="mode-stack"><div className="session-toolbar"><div className="matching-meta"><SessionProgress current={state.roundIndex + 1} total={rounds.length} /><span>{formatTime(elapsed)} · {state.mistakes} lỗi</span></div><StudyOrderControl value={order} onChange={changeOrder} onReshuffle={() => resetSession('random')} /></div><section className="question-card matching-exercise"><div className="matching-exercise__heading"><div><p className="exercise-label">Ghép cặp</p><h2>Mục từ và nghĩa</h2><p>Chọn một từ ở mỗi cột để tạo thành cặp đúng.</p></div><strong aria-label={`${state.matchedIds.length} trên ${round.pairs.length} cặp`}>{state.matchedIds.length}/{round.pairs.length}</strong></div><MatchingBoard round={round} state={state} onTerm={(id) => dispatch({ type: 'selectTerm', id })} onDefinition={(id) => dispatch({ type: 'selectDefinition', id })} /><p className="sr-only" aria-live="polite">{state.mismatch ? 'Hai lựa chọn chưa khớp.' : roundComplete ? 'Hoàn thành vòng.' : ''}</p></section>{roundComplete ? <Button className="next-button" onClick={() => { setElapsed(0); dispatch({ type: 'nextRound', startedAt: Date.now() }) }}>Vòng tiếp theo <ArrowRight aria-hidden="true" size={18} /></Button> : null}</div>
}
