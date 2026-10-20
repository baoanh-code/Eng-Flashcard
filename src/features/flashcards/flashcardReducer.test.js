import { describe, expect, it } from 'vitest'
import { createFlashcardSession } from './createFlashcardSession.js'
import { flashcardReducer } from './flashcardReducer.js'

const records = [{ id: 'a' }, { id: 'b' }]

describe('flashcard session', () => {
  it('keeps source order immutable and resets flip on navigation', () => {
    let state = createFlashcardSession(records)
    state = flashcardReducer(state, { type: 'flip' })
    state = flashcardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ index: 1, flipped: false, complete: false })
    expect(records.map((item) => item.id)).toEqual(['a', 'b'])
    expect(flashcardReducer(state, { type: 'next' }).complete).toBe(true)
  })

  it('replaces a classification without double-counting', () => {
    let state = createFlashcardSession(records)
    state = flashcardReducer(state, { type: 'classify', id: 'a', status: 'review' })
    state = flashcardReducer(state, { type: 'classify', id: 'a', status: 'learned' })
    expect(state.classifications).toEqual({ a: 'learned' })
  })

  it('removes a learned review card and keeps the next card active', () => {
    let state = createFlashcardSession(records)
    state = flashcardReducer(state, { type: 'remove', id: 'a' })
    expect(state).toMatchObject({ index: 0, flipped: false, complete: false })
    expect(state.records.map((item) => item.id)).toEqual(['b'])
  })
})
