import { describe, expect, it, vi } from 'vitest'
import {
  createDefaultProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  sanitizeProgress,
  saveProgress,
} from './progressStorage.js'

describe('progress storage', () => {
  it('recovers from corrupt and unsupported future data', () => {
    expect(loadProgress({ getItem: () => '{bad json' }).status).toBe('recovered')
    const future = JSON.stringify({ version: 99, learnedIds: ['x'] })
    expect(loadProgress({ getItem: () => future }).progress).toEqual(createDefaultProgress())
  })

  it('sanitizes IDs, enums, timestamps and overlapping status', () => {
    const value = sanitizeProgress({
      version: 2,
      learnedIds: ['a', 'a', '', 4],
      reviewIds: ['a', 'b', 'b'],
      lastSession: { levelId: 'a2', topicId: 'family', mode: 'writing', updatedAt: 'bad' },
      settings: { studyOrder: 'sideways' },
    })

    expect(value.learnedIds).toEqual(['a'])
    expect(value.reviewIds).toEqual(['b'])
    expect(value.lastSession).toBeNull()
    expect(value.settings.studyOrder).toBe('original')
  })

  it('migrates version zero and serializes a clean payload', () => {
    const storage = { getItem: () => JSON.stringify({ version: 0, learned: ['a'], review: ['b'] }) }
    const loaded = loadProgress(storage)
    const setItem = vi.fn()

    expect(loaded.progress).toMatchObject({ version: 2, learnedIds: ['a'], reviewIds: ['b'] })
    expect(saveProgress(loaded.progress, { setItem }).status).toBe('ready')
    expect(setItem).toHaveBeenCalledWith(PROGRESS_STORAGE_KEY, JSON.stringify(loaded.progress))
  })

  it('migrates progress IDs when a display spelling is corrected', () => {
    const storage = {
      getItem: () => JSON.stringify({
        version: 1,
        learnedIds: ['general-animals-fsh'],
        reviewIds: ['general-environment-desertifcation'],
        lastSession: null,
        settings: { studyOrder: 'random' },
      }),
    }

    expect(loadProgress(storage).progress).toMatchObject({
      version: 2,
      learnedIds: ['general-animals-fish'],
      reviewIds: ['general-environment-desertification'],
    })
  })

  it('continues safely when storage is unavailable or rejects writes', () => {
    expect(loadProgress(null).status).toBe('unavailable')
    expect(saveProgress(createDefaultProgress(), null).status).toBe('unavailable')
    expect(saveProgress(createDefaultProgress(), { setItem: () => { throw new Error('quota') } }).status).toBe('write-error')
  })
})
