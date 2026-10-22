import { shuffleArray } from '../../utils/shuffleArray.js'
import { createStudySessionRecords } from '../study/createStudySessionRecords.js'

export function createMatchingRounds(records, size = 6, random = Math.random, order = 'original') {
  const sessionRecords = createStudySessionRecords(records, order, random)
  const rounds = []
  let roundCount = Math.max(1, Math.ceil(sessionRecords.length / size))
  while (roundCount > 1 && sessionRecords.length < roundCount * 5) roundCount -= 1
  let index = 0
  while (index < sessionRecords.length) {
    const remaining = sessionRecords.length - index
    const remainingRounds = Math.max(1, roundCount - rounds.length)
    const nextSize = Math.min(8, Math.ceil(remaining / remainingRounds))
    const pairs = sessionRecords.slice(index, index + nextSize)
    const terms = shuffleArray(pairs, random)
    const definitions = shuffleArray(pairs, random)
    if (definitions.length > 1 && definitions.every((record, tileIndex) => record === terms[tileIndex])) {
      definitions.push(definitions.shift())
    }
    rounds.push({ pairs, terms, definitions })
    index += nextSize
  }
  return rounds
}
