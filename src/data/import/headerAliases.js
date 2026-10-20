import { normalizeHeaderKey } from './normalizeText.js'

const aliases = {
  term: ['term', 'word', 'phrase', 'english', 'englishterm'],
  definition: ['definition', 'meaning', 'vietnamese', 'vietnamesedefinition', 'translation'],
  example: ['example', 'examplesentence', 'sentence'],
  exampleTranslation: ['exampletranslation', 'translatedexample', 'examplemeaning', 'vietnameseexample'],
  topic: ['topic', 'category', 'theme'],
  level: ['level', 'cefr', 'cefrlevel'],
  ipa: ['ipa', 'pronunciation', 'phonetic'],
  partOfSpeech: ['partofspeech', 'pos', 'wordclass'],
}

const aliasMap = new Map()
for (const [field, fieldAliases] of Object.entries(aliases)) {
  for (const alias of fieldAliases) aliasMap.set(normalizeHeaderKey(alias), field)
}

export function resolveHeader(value) {
  return aliasMap.get(normalizeHeaderKey(value)) ?? null
}

export function hasRequiredHeaders(values) {
  const fields = new Set(values.map(resolveHeader).filter(Boolean))
  return fields.has('term') && fields.has('definition')
}

export function hasRecognizedHeader(values) {
  return values.some((value) => resolveHeader(value))
}
