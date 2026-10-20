import { describe, expect, it } from 'vitest'
import { createDefaultProgress } from '../../services/progressStorage.js'
import { progressReducer } from './progressReducer.js'

describe('progressReducer', () => {
  it('keeps learned and review statuses mutually exclusive through transitions', () => {
    let state = createDefaultProgress()
    for (const action of [
      { type: 'markLearned', id: 'one' },
      { type: 'markReview', id: 'one' },
      { type: 'markReview', id: 'two' },
      { type: 'markLearned', id: 'two' },
      { type: 'clearStatus', id: 'one' },
    ]) {
      state = progressReducer(state, action)
      expect(state.learnedIds.filter((id) => state.reviewIds.includes(id))).toEqual([])
    }
    expect(state).toMatchObject({ learnedIds: ['two'], reviewIds: [] })
  })

  it('resets one topic without touching other IDs and clears its last session', () => {
    const state = {
      ...createDefaultProgress(),
      learnedIds: ['topic-a', 'topic-b'],
      reviewIds: ['topic-c'],
      lastSession: { levelId: 'a2', topicId: 'family', mode: 'flashcards', updatedAt: '2026-10-19T00:00:00.000Z' },
    }
    const next = progressReducer(state, {
      type: 'resetTopic', ids: ['topic-a', 'topic-c'], levelId: 'a2', topicId: 'family',
    })

    expect(next.learnedIds).toEqual(['topic-b'])
    expect(next.reviewIds).toEqual([])
    expect(next.lastSession).toBeNull()
  })
})
