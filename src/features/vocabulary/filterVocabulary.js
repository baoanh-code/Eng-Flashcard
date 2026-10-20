import { normalizeKey } from '../../data/import/normalizeText.js'
import { getRecordStatus } from '../progress/progressSelectors.js'

export function filterVocabulary(records, { level = 'general', query = '', status = 'all', topic = 'all' }, progress, searchIndex) {
  const key = normalizeKey(query)
  return records.filter((record) => {
    if (record.level !== level) return false
    if (topic !== 'all' && record.topicId !== topic) return false
    if (status !== 'all' && getRecordStatus(record.id, progress) !== status) return false
    if (!key) return true
    const indexed = searchIndex.get(record.id)
    return indexed?.term.includes(key) || indexed?.definition.includes(key)
  })
}
