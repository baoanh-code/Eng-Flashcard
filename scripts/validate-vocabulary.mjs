import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildCatalog } from '../src/data/import/buildCatalog.js'
import { findVocabularyQualityIssues } from '../src/data/import/vocabularyQuality.js'
import { topicMetadataByLevel } from '../src/data/topics/general.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vocabularyRoot = path.join(projectRoot, 'src', 'data', 'vocabulary')

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(absolutePath)
    return /\.(csv|tsv)$/i.test(entry.name) ? [absolutePath] : []
  }))
  return nested.flat()
}

const files = await walk(vocabularyRoot)
const sources = await Promise.all(files.map(async (absolutePath) => ({
  path: path.relative(projectRoot, absolutePath).replace(/\\/g, '/'),
  text: await readFile(absolutePath, 'utf8'),
})))

const catalog = buildCatalog(sources, topicMetadataByLevel)
const qualityIssues = findVocabularyQualityIssues(catalog.records)

for (const diagnostic of catalog.diagnostics) {
  const location = diagnostic.row ? `${diagnostic.source}:${diagnostic.row}` : diagnostic.source
  const output = `[${diagnostic.severity.toUpperCase()}] ${diagnostic.code} ${location} — ${diagnostic.message}`
  if (diagnostic.severity === 'error') console.error(output)
  else console.warn(output)
}

const levels = new Set(catalog.records.map((record) => record.level))
console.log(`Validated ${catalog.records.length} vocabulary entries across ${catalog.topics.length} topics and ${levels.size} levels.`)

for (const issue of qualityIssues) console.error(`[ERROR] ${issue.type} ${issue.id}`)

if (catalog.hasErrors || qualityIssues.length) process.exitCode = 1
