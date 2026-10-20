import { describe, expect, it } from 'vitest'
import { createDefaultProgress } from '../../services/progressStorage.js'
import { filterVocabulary } from './filterVocabulary.js'

const records = [
  { id: 'a', level: 'a2', topicId: 'family', term: 'Mother', definition: 'Mẹ' },
  { id: 'b', level: 'a2', topicId: 'food', term: 'Rice', definition: 'Cơm' },
  { id: 'c', level: 'a2', topicId: 'family', term: 'Father', definition: 'Bố' },
]
const index = new Map(records.map((record) => [record.id, { term: record.term.toLowerCase(), definition: record.definition.toLowerCase() }]))

describe('filterVocabulary', () => {
  it('combines normalized search, topic and mutually exclusive status filters', () => {
    const progress = { ...createDefaultProgress(), learnedIds: ['a'], reviewIds: ['c'] }
    expect(filterVocabulary(records, { level: 'a2', topic: 'family', status: 'learned', query: '  moth ' }, progress, index).map((item) => item.id)).toEqual(['a'])
    expect(filterVocabulary(records, { level: 'a2', topic: 'all', status: 'review', query: '' }, progress, index).map((item) => item.id)).toEqual(['c'])
    expect(filterVocabulary(records, { level: 'a2', topic: 'all', status: 'not-studied', query: '' }, progress, index).map((item) => item.id)).toEqual(['b'])
  })
})
