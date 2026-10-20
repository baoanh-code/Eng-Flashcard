import { describe, expect, it } from 'vitest'
import { createQuestion } from './createQuestion.js'

const records = [
  { id: 'a', definition: 'một' }, { id: 'b', definition: 'hai' },
  { id: 'c', definition: 'ba' }, { id: 'd', definition: 'bốn' },
  { id: 'e', definition: 'hai' },
]

describe('createQuestion', () => {
  it('includes one correct answer and unique displayed definitions', () => {
    const question = createQuestion(records[0], records, records, () => 0)
    expect(question.options).toHaveLength(4)
    expect(question.options.filter((item) => item.id === 'a')).toHaveLength(1)
    expect(new Set(question.options.map((item) => item.definition)).size).toBe(4)
  })

  it('uses an honest smaller option count for a small pool', () => {
    expect(createQuestion(records[0], records.slice(0, 2), records.slice(0, 2)).options).toHaveLength(2)
  })
})
