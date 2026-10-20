import { ArrowLeft, ArrowRight, Check, Flag } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'

export function FlashcardControls({ classification, disablePrevious, onLearned, onNext, onPrevious, onReview }) {
  return <div className="flashcard-controls"><div className="button-row classification-actions"><Button aria-pressed={classification === 'review'} onClick={onReview} variant="ghost"><Flag aria-hidden="true" size={17} />Chưa thuộc</Button><Button aria-pressed={classification === 'learned'} onClick={onLearned} variant="ghost"><Check aria-hidden="true" size={17} />Đã học</Button></div><div className="button-row navigation-actions"><Button aria-label="Trước" disabled={disablePrevious} onClick={onPrevious} variant="ghost"><ArrowLeft aria-hidden="true" size={19} /></Button><Button aria-label="Tiếp" onClick={onNext} variant="ghost"><ArrowRight aria-hidden="true" size={19} /></Button></div></div>
}
