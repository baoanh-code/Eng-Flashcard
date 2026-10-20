import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildCatalog } from '../src/data/import/buildCatalog.js'
import { generateVocabularyId } from '../src/data/import/generateVocabularyId.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const candidateRoot = path.join(projectRoot, 'data', 'zim-1000')
const vocabularyRoot = path.join(candidateRoot, 'vocabulary', 'a2')
const topicsPath = path.join(candidateRoot, 'topics.a2.json')
const canonicalHeaders = ['Term', 'IPA', 'PartOfSpeech', 'Definition', 'Example', 'ExampleTranslation', 'Topic', 'Level']

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(absolutePath)
    return /\.(csv|tsv)$/iu.test(entry.name) ? [absolutePath] : []
  }))
  return nested.flat()
}

function assertUtf8(buffer, file) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    throw new Error(`Invalid UTF-8: ${file}`)
  }
}

const topics = JSON.parse(await readFile(topicsPath, 'utf8'))
const files = await walk(vocabularyRoot)
if (!files.length) throw new Error('Candidate A2 directory contains no CSV or TSV files.')

const sources = await Promise.all(files.map(async (absolutePath) => {
  const buffer = await readFile(absolutePath)
  if (!buffer.length) throw new Error(`Empty generated file: ${absolutePath}`)
  const text = assertUtf8(buffer, absolutePath)
  const headers = text.replace(/^\uFEFF/u, '').split(/\r?\n/u, 1)[0].split(',')
  if (headers.join('\u0000') !== canonicalHeaders.join('\u0000')) {
    throw new Error(`Non-canonical headers in ${absolutePath}: ${headers.join(',')}`)
  }
  return {
    path: `candidate/src/data/vocabulary/a2/${path.basename(absolutePath)}`,
    text,
  }
}))

const catalog = buildCatalog(sources, { a2: topics })
for (const diagnostic of catalog.diagnostics) {
  const location = diagnostic.row ? `${diagnostic.source}:${diagnostic.row}` : diagnostic.source
  const output = `[${diagnostic.severity.toUpperCase()}] ${diagnostic.code} ${location} — ${diagnostic.message}`
  if (diagnostic.severity === 'error') console.error(output)
  else console.warn(output)
}

const suspiciousIpa = catalog.records.filter((record) => record.ipa && (!record.ipa.startsWith('/') || !record.ipa.endsWith('/')))
if (suspiciousIpa.length) {
  for (const record of suspiciousIpa) console.error(`[ERROR] suspicious-ipa ${record.id} — ${record.ipa}`)
}

const contentIssues = []
const ids = new Set()
for (const record of catalog.records) {
  const expectedId = generateVocabularyId(record)
  if (record.id !== expectedId) contentIssues.push(`${record.id}: unstable ID; expected ${expectedId}`)
  if (ids.has(record.id)) contentIssues.push(`${record.id}: duplicate ID`)
  ids.add(record.id)
  if (record.level !== 'a2') contentIssues.push(`${record.id}: unexpected level ${record.level}`)
  if (!record.example) contentIssues.push(`${record.id}: missing reviewed example`)
  if (!record.exampleTranslation) contentIssues.push(`${record.id}: missing example translation`)
  if (record.example && !record.example.toLocaleLowerCase('en').includes(record.term.toLocaleLowerCase('en'))) {
    contentIssues.push(`${record.id}: example does not contain the target term`)
  }
}
for (const issue of contentIssues) console.error(`[ERROR] candidate-content ${issue}`)

console.log(`Validated candidate: ${catalog.records.length} A2 entries across ${catalog.topics.length} topics and ${files.length} files.`)
if (catalog.hasErrors || suspiciousIpa.length || contentIssues.length) process.exitCode = 1
