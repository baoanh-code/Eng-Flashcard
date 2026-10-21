import { describe, expect, it } from 'vitest'
import { findVocabularyQualityIssues } from './vocabularyQuality.js'

describe('findVocabularyQualityIssues', () => {
  it('detects banned template examples and malformed extracted terms', () => {
    const issues = findVocabularyQualityIssues([
      { id: 'a', term: 'fish', example: 'In this topic, “fish” means “cá” in Vietnamese.' },
      { id: 'b', term: 'fi\u0000sh', example: 'We caught a fish.' },
      { id: 'c', term: 'fsh', example: 'We caught a fish.' },
    ])
    expect(issues).toEqual([
      { id: 'a', type: 'template-example' },
      { id: 'b', type: 'malformed-term' },
      { id: 'c', type: 'malformed-term' },
    ])
  })

  it('accepts a corrected term and a natural example', () => {
    expect(findVocabularyQualityIssues([{ id: 'fish', term: 'fish', example: 'We caught a fish.' }])).toEqual([])
  })
})
