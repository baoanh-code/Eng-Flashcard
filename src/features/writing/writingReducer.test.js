import { describe, expect, it } from 'vitest'
import { writingReducer } from './writingReducer.js'

describe('writingReducer', () => {
  it('accepts case and whitespace but rejects spelling differences', () => {
    const initial = { records: [{ id: 'a' }], index: 0, correct: 0, incorrect: 0 }
    expect(writingReducer(initial, { type: 'answer', answer: '  HELLO ', term: 'hello' }).wasCorrect).toBe(true)
    expect(writingReducer(initial, { type: 'answer', answer: 'helo', term: 'hello' }).wasCorrect).toBe(false)
  })
})
