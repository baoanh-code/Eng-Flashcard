import { describe, expect, it } from 'vitest'
import { createDefaultProgress } from '../../services/progressStorage.js'
import { selectContinueTarget, selectProgressForRecords, selectReviewRecords } from './progressSelectors.js'

const records = [{ id: 'one' }, { id: 'two' }, { id: 'three' }]

describe('progress selectors', () => {
  it('counts current catalog records and ignores orphan IDs', () => {
    const progress = { ...createDefaultProgress(), learnedIds: ['one', 'orphan'], reviewIds: ['two'] }
    expect(selectProgressForRecords(records, progress)).toEqual({
      total: 3, learned: 1, review: 1, notStudied: 1, percentage: 33,
    })
    expect(selectReviewRecords(records, progress)).toEqual([{ id: 'two' }])
  })

  it('returns a continue target only while its topic remains in the catalog', () => {
    const session = { levelId: 'a2', topicId: 'family', mode: 'writing', updatedAt: '2026-10-19T00:00:00.000Z' }
    const progress = { ...createDefaultProgress(), lastSession: session }
    const catalog = { indexes: { byTopic: new Map([['a2:family', records]]) } }

    expect(selectContinueTarget(progress, catalog)).toEqual(session)
    expect(selectContinueTarget(progress, { indexes: { byTopic: new Map() } })).toBeNull()
  })
})
