import { describe, expect, it } from 'vitest'
import { createMatchingRounds } from './createMatchingRounds.js'
import { matchingReducer } from './matchingReducer.js'

describe('matching engine', () => {
  it('builds ordered rounds sequentially while randomizing tile placement', () => {
    const records = Array.from({ length: 10 }, (_, id) => ({ id: String(id) }))
    const rounds = createMatchingRounds(records, 5, () => 0, 'original')

    expect(rounds.map((round) => round.pairs.map((item) => item.id))).toEqual([
      ['0', '1', '2', '3', '4'],
      ['5', '6', '7', '8', '9'],
    ])
    expect(rounds[0].terms.map((item) => item.id)).not.toEqual(rounds[0].pairs.map((item) => item.id))
    expect(rounds[0].definitions.map((item) => item.id)).not.toEqual(rounds[0].pairs.map((item) => item.id))
    expect(rounds[0].definitions.map((item) => item.id)).not.toEqual(rounds[0].terms.map((item) => item.id))
  })

  it('shuffles the full pool before batching without losing or duplicating vocabulary', () => {
    const records = Array.from({ length: 14 }, (_, id) => ({ id: String(id) }))
    const rounds = createMatchingRounds(records, 6, () => 0, 'random')
    const ids = rounds.flatMap((round) => round.pairs.map((item) => item.id))

    expect(rounds.map((round) => round.pairs.length)).toEqual([7, 7])
    expect(ids).not.toEqual(records.map((item) => item.id))
    expect(new Set(ids).size).toBe(14)
    expect([...ids].sort((a, b) => Number(a) - Number(b))).toEqual(records.map((item) => item.id))
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
