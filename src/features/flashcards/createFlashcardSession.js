import { shuffleArray } from '../../utils/shuffleArray.js'

export function createFlashcardSession(records, order = 'original', random = Math.random) {
  return { records: order === 'random' ? shuffleArray(records, random) : [...records], index: 0, flipped: false, complete: records.length === 0, classifications: {} }
}
