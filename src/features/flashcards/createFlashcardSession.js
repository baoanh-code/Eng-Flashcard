import { createStudySessionRecords } from '../study/createStudySessionRecords.js'

export function createFlashcardSession(records, order = 'original', random = Math.random) {
  return { records: createStudySessionRecords(records, order, random), index: 0, flipped: false, complete: records.length === 0, classifications: {} }
}
