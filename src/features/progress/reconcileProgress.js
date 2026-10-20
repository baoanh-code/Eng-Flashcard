import { sanitizeProgress } from '../../services/progressStorage.js'

export function reconcileProgress(progress, records) {
  const ids = new Set(records.map((record) => record.id))
  const clean = sanitizeProgress(progress)
  return {
    ...clean,
    learnedIds: clean.learnedIds.filter((id) => ids.has(id)),
    reviewIds: clean.reviewIds.filter((id) => ids.has(id)),
  }
}
