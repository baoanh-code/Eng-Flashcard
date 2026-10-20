import { selectProgressForRecords } from '../progress/progressSelectors.js'

export function calculateTopicProgress(catalog, topicId, levelId, progress) {
  return selectProgressForRecords(
    catalog.indexes.byTopic.get(`${levelId}:${topicId}`) ?? [],
    progress,
  )
}
