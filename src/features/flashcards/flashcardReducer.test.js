import { describe, expect, it } from 'vitest'
import { createFlashcardSession } from './createFlashcardSession.js'
import { flashcardReducer } from './flashcardReducer.js'

const records = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('flashcard session', () => {
  it('keeps source order immutable and resets flip on navigation', () => {
    let state = createFlashcardSession(records)
    state = flashcardReducer(state, { type: 'flip' })
    state = flashcardReducer(state, { type: 'next' })
    expect(state).toMatchObject({ index: 1, flipped: false, complete: false })
    expect(records.map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
    state = flashcardReducer(state, { type: 'next' })
    state = flashcardReducer(state, { type: 'next' })
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
    expect(state.records.map((item) => item.id)).toEqual(['b', 'c', 'd'])
  })

  it('preserves every card exactly once in shuffled sessions and keeps active order stable', () => {
    const session = createFlashcardSession(records, 'random', () => 0)
    expect(session.records.map((item) => item.id)).not.toEqual(records.map((item) => item.id))
    expect([...session.records.map((item) => item.id)].sort()).toEqual(records.map((item) => item.id))
    expect(flashcardReducer(session, { type: 'flip' }).records).toBe(session.records)
  })

  it('keeps source order in ordered mode and resets only when explicitly requested', () => {
    const ordered = createFlashcardSession(records, 'original')
    const shuffled = createFlashcardSession(records, 'random', () => 0)
    expect(ordered.records.map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(flashcardReducer(ordered, { type: 'reset', session: shuffled })).toBe(shuffled)
  })
})
