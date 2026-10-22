import { createStudySessionRecords } from '../study/createStudySessionRecords.js'

export function createWritingSession(records, order = 'original', random = Math.random) {
  return {
    records: createStudySessionRecords(records, order, random),
    index: 0,
    answer: '',
    answered: false,
    wasCorrect: false,
    correct: 0,
    incorrect: 0,
    complete: records.length === 0,
  }
}
