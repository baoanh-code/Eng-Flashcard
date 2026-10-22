import { shuffleArray } from '../../utils/shuffleArray.js'

export function createStudySessionRecords(records, order = 'original', random = Math.random) {
  return order === 'random' ? shuffleArray(records, random) : [...records]
}
