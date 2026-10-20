import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const HEADERS = ['Term', 'IPA', 'PartOfSpeech', 'Definition', 'Example', 'ExampleTranslation', 'Topic', 'Level']
const ROOT = path.resolve('.')
const extractedPath = path.join(ROOT, 'data', 'pdf-1000', 'master', 'pdf-1000-raw.json')
const previousCleanPath = path.join(ROOT, 'data', 'zim-1000', 'master', 'zim-1000-clean.csv')
const outputRoot = path.join(ROOT, 'src', 'data', 'vocabulary', 'general')
const metadataPath = path.join(ROOT, 'src', 'data', 'topics', 'general.js')
const reportPath = path.join(ROOT, 'data', 'pdf-1000', 'manifest.json')

function display(value) {
  return String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()
}

function key(value) {
  return display(value).toLocaleLowerCase('en').replace(/[‐‑‒–—]/g, '-').replace(/[.'’]/g, '').replace(/\s+/g, ' ')
}

function slugify(value) {
  return display(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function csvText(rows) {
  return `\uFEFF${Papa.unparse(rows, { columns: HEADERS, newline: '\r\n' })}\r\n`
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeTerm(value, topic) {
  let term = display(value).replace(/[‐‑‒–—]/g, '-').replace(/\s+([,.;:!?])/g, '$1').replace(/[.;:,]+$/u, '')
  if (/^(a|an)\s+/iu.test(term)) term = term.replace(/^(a|an)\s+/iu, '')
  const preserveCase = topic === 'Countries' || /\b(christmas|tet|vietnam|da lat|do son|cau ngu|hung kings|mid-autumn|united states)\b/iu.test(term) || /^[A-Z]{2,5}$/.test(term)
  return preserveCase ? term : term.toLocaleLowerCase('en')
}

function inferredPartOfSpeech(row, previousBySourceRow) {
  const fromPrevious = previousBySourceRow.get(row.sourceRow)?.partOfSpeech
  if (fromPrevious) return fromPrevious
  const term = key(row.term)
  if (['enamored', 'charming'].includes(term)) return 'adjective'
  if (term.includes(' ')) return 'phrase'
  return ''
}

function generatedExample(record) {
  const quotedTerm = `“${record.Term}”`
  const quotedDefinition = `“${record.Definition}”`
  return [
    `In this topic, ${quotedTerm} means ${quotedDefinition} in Vietnamese.`,
    `Trong chủ đề này, ${quotedTerm} có nghĩa là ${quotedDefinition} trong tiếng Việt.`,
  ]
}

function groupBy(values, getKey) {
  const groups = new Map()
  for (const value of values) {
    const groupKey = getKey(value)
    if (!groups.has(groupKey)) groups.set(groupKey, [])
    groups.get(groupKey).push(value)
  }
  return groups
}

async function readPreviousRows() {
  const text = await readFile(previousCleanPath, 'utf8')
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  const bySourceRow = new Map()
  for (const row of parsed.data) {
    for (const sourceRow of display(row.SourceRows).split('|').map((value) => Number(value.trim())).filter(Number.isFinite)) {
      bySourceRow.set(sourceRow, {
        partOfSpeech: display(row.PartOfSpeech),
        example: display(row.Example),
        exampleTranslation: display(row.ExampleTranslation),
      })
    }
  }
  return bySourceRow
}

function buildRecords(rows, previousBySourceRow) {
  const normalizedRows = rows.map((row) => ({
    ...row,
    normalizedTerm: normalizeTerm(row.term, row.topic),
  }))
  const groups = groupBy(normalizedRows, (row) => `${slugify(row.topic)}::${key(row.normalizedTerm)}`)
  return [...groups.values()].map((rowsInGroup) => {
    const first = rowsInGroup[0]
    const previous = rowsInGroup.map((row) => previousBySourceRow.get(row.sourceRow)).find((row) => row?.example && row?.exampleTranslation)
    const record = {
      Term: first.normalizedTerm,
      IPA: unique(rowsInGroup.map((row) => display(row.ipa)))[0] ?? '',
      PartOfSpeech: inferredPartOfSpeech(first, previousBySourceRow),
      Definition: unique(rowsInGroup.map((row) => display(row.definition))).join(' / '),
      Example: previous?.example ?? '',
      ExampleTranslation: previous?.exampleTranslation ?? '',
      Topic: first.topic,
      Level: 'General',
      sourceRows: rowsInGroup.map((row) => row.sourceRow),
    }
    if (!record.Example || !record.ExampleTranslation) [record.Example, record.ExampleTranslation] = generatedExample(record)
    return record
  })
}

function buildDuplicateStats(rows, records) {
  const byTerm = groupBy(rows, (row) => key(normalizeTerm(row.term, row.topic)))
  const exactKeys = rows.map((row) => [slugify(row.topic), key(normalizeTerm(row.term, row.topic)), display(row.ipa), display(row.definition)].join('::'))
  const exactCounts = [...groupBy(exactKeys, (value) => value).values()]
  const sameTopicDuplicates = rows.length - records.length
  const duplicateGroups = [...byTerm.values()].filter((group) => group.length > 1)
  return {
    uniqueNormalizedTerms: byTerm.size,
    duplicateTerms: duplicateGroups.length,
    duplicateOccurrences: duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0),
    exactDuplicateRows: exactCounts.reduce((sum, group) => sum + Math.max(0, group.length - 1), 0),
    sameTopicDuplicateOccurrences: sameTopicDuplicates,
    crossTopicDuplicateOccurrences: rows.length - byTerm.size - sameTopicDuplicates,
  }
}

function topicMetadata(rows) {
  const topics = []
  const seen = new Set()
  for (const row of rows) {
    if (seen.has(row.topic)) continue
    seen.add(row.topic)
    topics.push({
      id: slugify(row.topic),
      level: 'general',
      name: row.topic,
      description: `${row.sourceTopic}.`,
      sourceAliases: [slugify(row.topic)],
      nameAliases: [row.sourceTopic],
    })
  }
  return topics
}

async function main() {
  const extracted = JSON.parse(await readFile(extractedPath, 'utf8'))
  const previousBySourceRow = await readPreviousRows()
  const records = buildRecords(extracted.rows, previousBySourceRow)
  const topics = topicMetadata(extracted.rows)
  const duplicateStats = buildDuplicateStats(extracted.rows, records)

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })
  for (const [topic, topicRecords] of groupBy(records, (record) => record.Topic)) {
    await writeFile(path.join(outputRoot, `${slugify(topic)}.csv`), csvText(topicRecords.map((record) => Object.fromEntries(HEADERS.map((header) => [header, record[header]])))), 'utf8')
  }

  const metadataSource = `export const generalTopics = ${JSON.stringify(topics, null, 2)}\n\nexport const topicMetadataByLevel = {\n  general: generalTopics,\n}\n`
  await writeFile(metadataPath, metadataSource, 'utf8')

  const malformedRows = extracted.rows.filter((row) => !display(row.term) || !display(row.definition)).length
  const files = (await readdir(outputRoot)).filter((name) => name.endsWith('.csv'))
  const manifest = {
    generatedAt: new Date().toISOString(),
    canonicalSource: extracted.source,
    rawSourceRows: extracted.rawRowCount,
    productionEntries: records.length,
    sourceTopics: extracted.topicCount,
    productionFiles: files.length,
    malformedRows,
    skippedRows: malformedRows,
    missingIpa: extracted.rows.filter((row) => !display(row.ipa)).length,
    missingPartOfSpeech: records.filter((record) => !record.PartOfSpeech).length,
    examplesPreserved: records.filter((record) => !record.Example.startsWith('In this topic,')).length,
    examplesGenerated: records.filter((record) => record.Example.startsWith('In this topic,')).length,
    ...duplicateStats,
    topicCounts: extracted.topicCounts,
  }
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
