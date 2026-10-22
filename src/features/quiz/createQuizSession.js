import { createStudySessionRecords } from '../study/createStudySessionRecords.js'

export function createQuizSession(records, order = 'original', random = Math.random) {
  return {
    records: createStudySessionRecords(records, order, random),
    index: 0,
    selectedId: null,
    correct: 0,
    incorrect: 0,
    complete: records.length === 0,
  }
}
