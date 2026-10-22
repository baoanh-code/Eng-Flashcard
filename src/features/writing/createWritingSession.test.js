import { describe, expect, it } from 'vitest'
import { createWritingSession } from './createWritingSession.js'
import { writingReducer } from './writingReducer.js'

const records = Array.from({ length: 6 }, (_, index) => ({ id: String(index), term: String(index) }))

describe('writing study order', () => {
  it('uses canonical prompt order in ordered mode', () => {
    expect(createWritingSession(records).records.map((record) => record.id)).toEqual(['0', '1', '2', '3', '4', '5'])
  })

  it('keeps one valid shuffled prompt order stable during the active session', () => {
    const session = createWritingSession(records, 'random', () => 0)
    const ids = session.records.map((record) => record.id)
    const answered = writingReducer(session, { type: 'answer', answer: '0', term: '0' })

    expect(ids).not.toEqual(records.map((record) => record.id))
    expect([...ids].sort()).toEqual(records.map((record) => record.id))
    expect(new Set(ids).size).toBe(records.length)
    expect(answered.records).toBe(session.records)
  })
})
