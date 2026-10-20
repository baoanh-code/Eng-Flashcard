import { createDiagnostic, DiagnosticCode } from './diagnostics.js'
import { normalizeKey } from './normalizeText.js'
import { normalizeRow } from './normalizeRow.js'
import { parseSource } from './parseSource.js'

function levelFromPath(path) {
  return path.replace(/\\/g, '/').match(/\/vocabulary\/([^/]+)\//)?.[1]?.toLocaleLowerCase('en') ?? ''
}

export function buildCatalog(sources, metadataByLevel = {}) {
  const diagnostics = []
  const records = []
  const discoveredTopics = new Map()
  const seenIds = new Map()
  const seenTerms = new Map()

  for (const source of sources) {
    const parsed = parseSource(source)
    diagnostics.push(...parsed.diagnostics)
    const level = levelFromPath(source.path)
    const metadata = metadataByLevel[level] ?? []

    for (const row of parsed.rows) {
      const normalized = normalizeRow({ metadata, row, source: source.path })
      diagnostics.push(...normalized.diagnostics)
      if (!normalized.record) continue

      const record = normalized.record
      const termKey = `${record.level}:${record.topicId}:${normalizeKey(record.term)}`

      if (seenTerms.has(termKey)) {
        diagnostics.push(createDiagnostic({
          code: DiagnosticCode.DUPLICATE_TERM,
          message: `Duplicate term “${record.term}” in topic “${record.topic}”; first seen at ${seenTerms.get(termKey)}.`,
          row: row.row,
          source: source.path,
        }))
        continue
      }

      if (seenIds.has(record.id)) {
        diagnostics.push(createDiagnostic({
          code: DiagnosticCode.DUPLICATE_ID,
          message: `Generated ID “${record.id}” collides with ${seenIds.get(record.id)}.`,
          row: row.row,
          source: source.path,
        }))
        continue
      }

      seenTerms.set(termKey, `${source.path}:${row.row}`)
      seenIds.set(record.id, `${source.path}:${row.row}`)
      records.push(record)
      discoveredTopics.set(`${record.level}:${record.topicId}`, normalized.topicMetadata)
    }
  }

  const byId = new Map(records.map((record) => [record.id, record]))
  const byLevel = new Map()
  const byTopic = new Map()
  const searchIndex = new Map()

  for (const record of records) {
    if (!byLevel.has(record.level)) byLevel.set(record.level, [])
    const topicKey = `${record.level}:${record.topicId}`
    if (!byTopic.has(topicKey)) byTopic.set(topicKey, [])
    byLevel.get(record.level).push(record)
    byTopic.get(topicKey).push(record)
    searchIndex.set(record.id, Object.freeze({
      definition: normalizeKey(record.definition),
      term: normalizeKey(record.term),
    }))
  }

  const topics = [...discoveredTopics.entries()]
    .map(([key, metadata]) => {
      const [level, topicId] = key.split(':')
      const topicRecords = byTopic.get(key) ?? []
      return Object.freeze({
        id: topicId,
        name: metadata.name,
        description: metadata.description ?? '',
        icon: metadata.icon ?? 'book-open',
        level,
        totalWords: topicRecords.filter((record) => record.level === level).length,
      })
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))

  return Object.freeze({
    diagnostics: Object.freeze(diagnostics),
    hasErrors: diagnostics.some((diagnostic) => diagnostic.severity === 'error'),
    indexes: Object.freeze({ byId, byLevel, byTopic, searchIndex }),
    records: Object.freeze(records),
    topics: Object.freeze(topics),
  })
}
