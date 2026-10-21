import { describe, expect, it } from 'vitest'
import { sortTopicsByProgress } from './sortTopicsByProgress.js'

const topics = [{ id: 'alpha' }, { id: 'beta' }, { id: 'gamma' }, { id: 'delta' }]

describe('sortTopicsByProgress', () => {
  it('orders not started, in progress, then completed while keeping every topic', () => {
    const progress = {
      alpha: { total: 2, learned: 2, review: 0 },
      beta: { total: 2, learned: 0, review: 0 },
      gamma: { total: 2, learned: 1, review: 0 },
      delta: { total: 2, learned: 0, review: 0 },
    }
    expect(sortTopicsByProgress(topics, (topic) => progress[topic.id]).map((topic) => topic.id)).toEqual(['beta', 'delta', 'gamma', 'alpha'])
  })

  it('updates from progress and preserves the original secondary order', () => {
    const before = sortTopicsByProgress(topics, () => ({ total: 2, learned: 0, review: 0 }))
    const after = sortTopicsByProgress(topics, (topic) => ({ total: 2, learned: topic.id === 'alpha' ? 2 : 0, review: 0 }))
    expect(before.map((topic) => topic.id)).toEqual(['alpha', 'beta', 'gamma', 'delta'])
    expect(after.map((topic) => topic.id)).toEqual(['beta', 'gamma', 'delta', 'alpha'])
  })
})
