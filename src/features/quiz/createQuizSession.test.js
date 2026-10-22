import { describe, expect, it } from 'vitest'
import { createQuizSession } from './createQuizSession.js'
import { quizReducer } from './quizReducer.js'

const records = Array.from({ length: 6 }, (_, index) => ({ id: String(index) }))

describe('multiple-choice study order', () => {
  it('uses canonical target order in ordered mode', () => {
    expect(createQuizSession(records).records.map((record) => record.id)).toEqual(['0', '1', '2', '3', '4', '5'])
  })

  it('shuffles the full target pool once without losing or duplicating vocabulary', () => {
    const session = createQuizSession(records, 'random', () => 0)
    const ids = session.records.map((record) => record.id)

    expect(ids).not.toEqual(records.map((record) => record.id))
    expect([...ids].sort()).toEqual(records.map((record) => record.id))
    expect(new Set(ids).size).toBe(records.length)
    expect(quizReducer(session, { type: 'answer', id: '0', correctId: '0' }).records).toBe(session.records)
  })
})
