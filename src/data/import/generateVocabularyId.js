import { slugify } from './normalizeText.js'

export function generateVocabularyId({ level, term, topicId }) {
  const segments = [slugify(level), slugify(topicId), slugify(term)]
  if (segments.some((segment) => !segment)) return ''
  return segments.join('-')
}
