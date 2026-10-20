import { createDiagnostic, DiagnosticCode } from './diagnostics.js'
import { generateVocabularyId } from './generateVocabularyId.js'
import { humanizeFilename, normalizeDisplayText, normalizeKey, slugify } from './normalizeText.js'

function getSourceContext(source) {
  const normalized = source.replace(/\\/g, '/')
  const levelMatch = normalized.match(/\/vocabulary\/([^/]+)\//)
  const filename = normalized.split('/').pop() ?? ''
  return {
    filename,
    filenameStem: filename.replace(/\.[^.]+$/, ''),
    level: levelMatch?.[1]?.toLocaleLowerCase('en') ?? '',
  }
}

function matchesTopic(metadata, value) {
  const key = normalizeKey(value)
  const candidates = [metadata.id, metadata.name, ...(metadata.nameAliases ?? []), ...(metadata.sourceAliases ?? [])]
  return candidates.some((candidate) => normalizeKey(candidate) === key)
}

function resolveTopic({ metadata, rowTopic, sourceContext }) {
  const fromSource = metadata.find((item) =>
    [item.id, ...(item.sourceAliases ?? [])].some((alias) => slugify(alias) === slugify(sourceContext.filenameStem)),
  )
  if (fromSource) return fromSource

  const fromRow = rowTopic ? metadata.find((item) => matchesTopic(item, rowTopic)) : null
  if (fromRow) return fromRow

  const displayName = normalizeDisplayText(rowTopic) || humanizeFilename(sourceContext.filename)
  const id = slugify(displayName)
  if (!id || !displayName) return null

  return {
    id,
    level: sourceContext.level,
    name: displayName,
    description: '',
    icon: 'book-open',
    sourceAliases: [sourceContext.filenameStem],
  }
}

export function normalizeRow({ metadata = [], row, source }) {
  const diagnostics = []
  const sourceContext = getSourceContext(source)
  const term = normalizeDisplayText(row.values.term)
  const definition = normalizeDisplayText(row.values.definition)

  if (!sourceContext.level || !/^[a-z][a-z0-9-]*$/.test(sourceContext.level)) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.INVALID_LEVEL,
      message: 'Level must be derived from a valid level-first directory such as vocabulary/a2/.',
      row: row.row,
      source,
    }))
  }

  const declaredLevel = normalizeKey(row.values.level)
  if (declaredLevel && declaredLevel !== sourceContext.level) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.INVALID_LEVEL,
      message: `Declared level “${declaredLevel}” conflicts with directory level “${sourceContext.level}”.`,
      row: row.row,
      source,
    }))
  }

  if (!term) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.MISSING_TERM,
      message: 'Vocabulary row is missing a term.',
      row: row.row,
      source,
    }))
  }

  if (!definition) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.MISSING_DEFINITION,
      message: 'Vocabulary row is missing a definition.',
      row: row.row,
      source,
    }))
  }

  const topicMetadata = resolveTopic({
    metadata,
    rowTopic: normalizeDisplayText(row.values.topic),
    sourceContext,
  })

  if (!topicMetadata) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.UNRESOLVED_TOPIC,
      message: 'Topic is empty and could not be derived from configuration or filename.',
      row: row.row,
      source,
    }))
  }

  if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
    return { diagnostics, record: null, topicMetadata: null }
  }

  const record = Object.freeze({
    id: generateVocabularyId({ level: sourceContext.level, term, topicId: topicMetadata.id }),
    level: sourceContext.level,
    topicId: topicMetadata.id,
    topic: topicMetadata.name,
    term,
    definition,
    example: normalizeDisplayText(row.values.example) || null,
    exampleTranslation: normalizeDisplayText(row.values.exampleTranslation) || null,
    ipa: normalizeDisplayText(row.values.ipa) || null,
    partOfSpeech: normalizeDisplayText(row.values.partOfSpeech) || null,
  })

  return { diagnostics, record, topicMetadata }
}
