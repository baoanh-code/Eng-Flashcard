import { normalizeAnswer } from '../../utils/normalizeAnswer.js'
import { shuffleArray } from '../../utils/shuffleArray.js'

export function createQuestion(record, topicRecords, levelRecords = topicRecords, random = Math.random) {
  const used = new Set([normalizeAnswer(record.definition)])
  const distractors = []
  for (const candidate of [...topicRecords, ...levelRecords]) {
    const key = normalizeAnswer(candidate.definition)
    if (candidate.id !== record.id && !used.has(key)) { used.add(key); distractors.push(candidate); if (distractors.length === 3) break }
  }
  return { record, options: shuffleArray([record, ...distractors], random) }
}
