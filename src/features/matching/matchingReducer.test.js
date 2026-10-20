import { describe, expect, it } from 'vitest'
import { createMatchingRounds } from './createMatchingRounds.js'
import { matchingReducer } from './matchingReducer.js'

describe('matching engine', () => {
  it('creates honest unique rounds', () => {
    const records = Array.from({ length: 14 }, (_, id) => ({ id: String(id) }))
    const rounds = createMatchingRounds(records, 6, () => 0)
    expect(rounds.map((round) => round.pairs.length)).toEqual([7, 7])
    expect(new Set(rounds.flatMap((round) => round.pairs.map((item) => item.id))).size).toBe(14)
  })

  it('supports same-side replacement, match, mismatch and retry', () => {
    let state = { matchedIds: [], selectedTermId: null, selectedDefinitionId: null, mismatch: null, mistakes: 0 }
    state = matchingReducer(state, { type: 'selectTerm', id: 'a' })
    state = matchingReducer(state, { type: 'selectTerm', id: 'b' })
    expect(state.selectedTermId).toBe('b')
    state = matchingReducer(state, { type: 'selectDefinition', id: 'a' })
    expect(state.mistakes).toBe(1)
    state = matchingReducer(state, { type: 'clearMismatch' })
    state = matchingReducer(state, { type: 'selectTerm', id: 'a' })
    state = matchingReducer(state, { type: 'selectDefinition', id: 'a' })
    expect(state.matchedIds).toEqual(['a'])
  })
})
