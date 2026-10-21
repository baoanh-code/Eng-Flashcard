import { Volume2 } from 'lucide-react'
import { pronounceEnglishTerm } from '../../services/pronunciation.js'

export function Flashcard({ flipped, onFlip, record }) {
  const cardLabel = record.partOfSpeech?.toUpperCase() || 'VOCABULARY'
  return (
    <div className="flashcard-shell">
      <button className={`flashcard ${flipped ? 'is-flipped' : ''}`} onClick={onFlip} type="button">
        <span className="flashcard__side-label">{cardLabel}</span>
        {flipped ? (
          <span className="flashcard__content flashcard__content--back">
            <strong className="flashcard__term-context">{record.term}</strong>
            {record.ipa ? <span className="flashcard__ipa">{record.ipa}</span> : null}
            <span className="flashcard__definition">{record.definition}</span>
            {record.example ? <span className="example">{record.example}</span> : null}
            {record.exampleTranslation ? <span className="example-translation">{record.exampleTranslation}</span> : null}
          </span>
        ) : (
          <span className="flashcard__content">
            <strong>{record.term}</strong>
            {record.ipa ? <span className="flashcard__ipa">{record.ipa}</span> : null}
          </span>
        )}
        <span className="flashcard__hint">↻ Lật thẻ</span>
      </button>
      <button aria-label={`Nghe — Pronounce ${record.term}`} className="flashcard__pronounce" onClick={() => pronounceEnglishTerm(record.term)} type="button">
        <Volume2 aria-hidden="true" size={19} />
        <span>Nghe</span>
      </button>
    </div>
  )
}
