export function getRecordStatus(recordId, progress) {
  if (progress.learnedIds.includes(recordId)) return 'learned'
  if (progress.reviewIds.includes(recordId)) return 'review'
  return 'not-studied'
}

export function selectProgressForRecords(records, progress) {
  const ids = new Set(records.map((record) => record.id))
  const learned = progress.learnedIds.filter((id) => ids.has(id)).length
  const review = progress.reviewIds.filter((id) => ids.has(id)).length
  const total = records.length
  return {
    total,
    learned,
    review,
    notStudied: Math.max(0, total - learned - review),
    percentage: total === 0 ? 0 : Math.round((learned / total) * 100),
  }
}

export function selectReviewRecords(records, progress) {
  const reviewSet = new Set(progress.reviewIds)
  return records.filter((record) => reviewSet.has(record.id))
}

export function selectContinueTarget(progress, catalog) {
  const session = progress.lastSession
  if (!session) return null
  const key = `${session.levelId}:${session.topicId}`
  return catalog.indexes.byTopic.has(key) ? session : null
}
