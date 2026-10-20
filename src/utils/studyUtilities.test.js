import { describe, expect, it } from 'vitest'
import { normalizeAnswer } from './normalizeAnswer.js'
import { shuffleArray } from './shuffleArray.js'

describe('study utilities', () => {
  it('normalizes only case and whitespace, not spelling', () => {
    expect(normalizeAnswer('  Xin   CHÀO\n')).toBe('xin chào')
    expect(normalizeAnswer('colour')).not.toBe(normalizeAnswer('color'))
  })

  it('shuffles a copy with injectable randomness', () => {
    const original = [1, 2, 3, 4]
    const shuffled = shuffleArray(original, () => 0)
    expect(original).toEqual([1, 2, 3, 4])
    expect(shuffled).toEqual([2, 3, 4, 1])
    expect([...shuffled].sort()).toEqual(original)
  })
})
