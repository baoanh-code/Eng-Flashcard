import { shuffleArray } from '../../utils/shuffleArray.js'

export function createMatchingRounds(records, size = 6, random = Math.random) {
  const rounds = []
  let roundCount = Math.max(1, Math.ceil(records.length / size))
  while (roundCount > 1 && records.length < roundCount * 5) roundCount -= 1
  let index = 0
  while (index < records.length) {
    const remaining = records.length - index
    const remainingRounds = Math.max(1, roundCount - rounds.length)
    const nextSize = Math.min(8, Math.ceil(remaining / remainingRounds))
    const pairs = records.slice(index, index + nextSize)
    rounds.push({ pairs, terms: shuffleArray(pairs, random), definitions: shuffleArray(pairs, random) })
    index += nextSize
  }
  return rounds
}
