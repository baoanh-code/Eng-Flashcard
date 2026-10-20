import { FlashcardMode } from '../flashcards/FlashcardMode.jsx'

export function ReviewFlashcards(props) {
  return <FlashcardMode {...props} removeLearnedCards />
}
