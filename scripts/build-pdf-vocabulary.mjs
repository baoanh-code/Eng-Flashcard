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

// The PDF text layer drops letters and word boundaries around several “f”
// ligatures. Keep corrections keyed by canonical PDF row so rebuilding remains
// deterministic and unusual-but-valid terms are never guessed at globally.
const TERM_CORRECTIONS = new Map([
  [76, 'desertification'], [90, 'greenhouse effect'], [92, 'Affection'],
  [102, 'Confidence'], [146, 'Terrific'], [172, 'affection'], [189, 'fidelity'],
  [204, 'buffet'], [212, 'coffee'], [281, 'fish'], [296, 'Braised fish'],
  [306, 'Fried fish'], [340, 'fishing'], [387, 'fitting room'],
  [459, 'science fiction'], [472, 'fiction'], [473, 'non-fiction'],
  [476, 'science fiction'], [482, 'historical fiction'], [527, 'fitness'],
  [549, 'offside'], [597, 'firecrackers'], [607, 'five-fruit tray'],
  [637, 'giraffe'], [648, 'fish'], [658, 'daffodil'], [742, 'Traffic light'],
  [756, 'Police officer'], [757, 'Firefighter'], [876, 'Buffalo Fighting Festival'],
  [877, 'Reunification Day'], [886, 'Do Son Buffalo Fighting Festival'],
  [906, 'Mooncake filling'], [909, "Blind man's bluff"], [917, 'Cockfighting'],
  [970, 'Profit'], [991, 'Traffic'], [1041, 'Office'],
])

const IPA_CORRECTIONS = new Map([
  [70, '/kəˈtæstrəfi/'], [212, '/ˈkɒfi/'], [333, '/fəˈtɑːɡrəfi/'],
  [412, '/fəˈtɑːɡrəfi/'], [480, '/baɪˈɑːɡrəfi/'],
  [481, '/ˌɔːtoʊbaɪˈɑːɡrəfi/'], [522, '/dɪˈfiːt/'],
  [788, '/ˈfiːvər/'], [791, '/ˈfiːvər/'], [834, '/dʒiˈɑːɡrəfi/'],
  [849, '/fɪˈlɒsəfi/'], [951, '/fəˈtɑːɡrəfi/'],
])

const DEFINITION_CORRECTIONS = new Map([
  [417, 'độ phơi sáng'], [424, 'độ phơi sáng'], [430, 'độ phơi sáng'],
  [691, 'bông tuyết'], [916, 'thả diều'], [921, 'trò chơi chuyền'],
  [934, 'hiện vật'], [977, 'quan hệ đối tác'], [984, 'quan hệ đối tác'],
])

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
  const preserveCase = ['Countries', 'Vietnamese Festivals'].includes(topic) || /\b(christmas|tet|vietnam|da lat|do son|cau ngu|hung kings|mid-autumn|united states)\b/iu.test(term) || /^[A-Z]{2,5}$/.test(term)
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
  const term = record.Term
  const meaning = record.Definition.toLocaleLowerCase('vi')
  const partOfSpeech = record.PartOfSpeech.toLocaleLowerCase('en')

  if (partOfSpeech === 'verb') {
    return [`They will ${term} when the time is right.`, `Họ sẽ ${meaning} khi thời điểm phù hợp.`]
  }
  if (partOfSpeech === 'adjective') {
    return [`The teacher described it as ${term}.`, `Giáo viên mô tả điều đó là ${meaning}.`]
  }
  if (partOfSpeech === 'adverb') {
    return [`She completed the task ${term}.`, `Cô ấy hoàn thành nhiệm vụ ${meaning}.`]
  }

  const topicTemplates = {
    Family: [`We talked about ${term} at dinner.`, `Chúng tôi nói về ${meaning} trong bữa tối.`],
    Clothes: [`She chose the ${term} for her trip.`, `Cô ấy chọn ${meaning} cho chuyến đi.`],
    Environment: [`The class learned about ${term} today.`, `Hôm nay cả lớp học về ${meaning}.`],
    Personality: [`They talked openly about ${term}.`, `Họ nói chuyện cởi mở về ${meaning}.`],
    Emotions: [`They talked openly about ${term}.`, `Họ nói chuyện cởi mở về ${meaning}.`],
    Relationships: [`We discussed ${term} during the meeting.`, `Chúng tôi thảo luận về ${meaning} trong cuộc họp.`],
    Love: [`We discussed ${term} during the meeting.`, `Chúng tôi thảo luận về ${meaning} trong cuộc họp.`],
    Food: [`We included ${term} in the meal.`, `Chúng tôi dùng ${meaning} trong bữa ăn.`],
    Drinks: [`They served ${term} with lunch.`, `Họ phục vụ ${meaning} cùng bữa trưa.`],
    Fruit: [`We bought some ${term} at the market.`, `Chúng tôi mua ${meaning} ở chợ.`],
    Vegetables: [`We added ${term} to the meal.`, `Chúng tôi thêm ${meaning} vào bữa ăn.`],
    Seafood: [`The restaurant serves fresh ${term}.`, `Nhà hàng phục vụ ${meaning} tươi.`],
    'Vietnamese Dishes': [`We ordered ${term} for dinner.`, `Chúng tôi gọi ${meaning} cho bữa tối.`],
    Cooking: [`We used ${term} while cooking.`, `Chúng tôi dùng ${meaning} khi nấu ăn.`],
    Kitchen: [`We used the ${term} while preparing dinner.`, `Chúng tôi dùng ${meaning} khi chuẩn bị bữa tối.`],
    Hobbies: [`They practiced ${term} after school.`, `Họ luyện ${meaning} sau giờ học.`],
    Music: [`We learned about ${term} in music class.`, `Chúng tôi học về ${meaning} trong giờ âm nhạc.`],
    Shopping: [`I saw the ${term} at the shop.`, `Tôi thấy ${meaning} ở cửa hàng.`],
    Travel: [`We discussed ${term} while planning the trip.`, `Chúng tôi thảo luận về ${meaning} khi lên kế hoạch chuyến đi.`],
    Photography: [`The photographer explained ${term} clearly.`, `Nhiếp ảnh gia giải thích rõ về ${meaning}.`],
    Entertainment: [`They discussed ${term} after the show.`, `Họ thảo luận về ${meaning} sau buổi diễn.`],
    'Film Genres': [`We watched a ${term} last night.`, `Tối qua chúng tôi xem một bộ phim ${meaning}.`],
    'Book Genres': [`She borrowed a ${term} from the library.`, `Cô ấy mượn một cuốn ${meaning} từ thư viện.`],
    Beauty: [`She learned about ${term} at the salon.`, `Cô ấy tìm hiểu về ${meaning} tại tiệm làm đẹp.`],
    Sports: [`They practiced ${term} after school.`, `Họ luyện ${meaning} sau giờ học.`],
    Football: [`The coach explained ${term} to the team.`, `Huấn luyện viên giải thích ${meaning} cho đội.`],
    Home: [`We talked about the ${term} in our new home.`, `Chúng tôi nói về ${meaning} trong ngôi nhà mới.`],
    Tet: [`The family prepared ${term} for Tet.`, `Gia đình chuẩn bị ${meaning} cho ngày Tết.`],
    'Daily Life': [`We discussed ${term} in class today.`, `Hôm nay chúng tôi thảo luận về ${meaning} trong lớp.`],
    Animals: [`The children learned about the ${term}.`, `Bọn trẻ học về ${meaning}.`],
    Flowers: [`She planted ${term} in the garden.`, `Cô ấy trồng ${meaning} trong vườn.`],
    Christmas: [`The family prepared ${term} for Christmas.`, `Gia đình chuẩn bị ${meaning} cho Giáng sinh.`],
    Colors: [`She chose ${term} for the design.`, `Cô ấy chọn ${meaning} cho thiết kế.`],
    Transport: [`We used ${term} during the journey.`, `Chúng tôi dùng ${meaning} trong chuyến đi.`],
    'Traffic Signs': [`The driver noticed the ${term}.`, `Người lái xe chú ý đến ${meaning}.`],
    Jobs: [`The class learned about the work of a ${term}.`, `Cả lớp học về công việc của ${meaning}.`],
    Health: [`The doctor explained ${term} clearly.`, `Bác sĩ giải thích rõ về ${meaning}.`],
    Illnesses: [`The doctor checked for ${term}.`, `Bác sĩ kiểm tra dấu hiệu ${meaning}.`],
    Education: [`The teacher explained ${term} in class.`, `Giáo viên giải thích ${meaning} trong lớp.`],
    'School Subjects': [`We studied ${term} at school.`, `Chúng tôi học ${meaning} ở trường.`],
    Skills: [`We practiced ${term} in class.`, `Chúng tôi luyện ${meaning} trong lớp.`],
    'Vietnamese Festivals': [`The family talked about ${term} before the festival.`, `Gia đình nói về ${meaning} trước lễ hội.`],
    'Mid-Autumn Festival': [`The children enjoyed ${term} at the festival.`, `Bọn trẻ thích ${meaning} tại lễ hội.`],
    'Folk Games': [`The children played ${term} together.`, `Bọn trẻ cùng chơi ${meaning}.`],
    Culture: [`The class learned about ${term} today.`, `Hôm nay cả lớp học về ${meaning}.`],
    Art: [`The students discussed ${term} in art class.`, `Học sinh thảo luận về ${meaning} trong giờ mỹ thuật.`],
    Business: [`The team discussed ${term} at work.`, `Nhóm thảo luận về ${meaning} tại nơi làm việc.`],
    City: [`We saw the ${term} in the city centre.`, `Chúng tôi thấy ${meaning} ở trung tâm thành phố.`],
    Countries: [`They learned about ${term} in geography class.`, `Họ học về ${meaning} trong giờ địa lý.`],
    'Office Life': [`The team discussed ${term} at work.`, `Nhóm thảo luận về ${meaning} tại nơi làm việc.`],
  }
  return topicTemplates[record.Topic] ?? [`We discussed ${term} in class today.`, `Hôm nay chúng tôi thảo luận về ${meaning} trong lớp.`]
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
  const normalizedRows = rows.map((row) => {
    const correctedTerm = TERM_CORRECTIONS.get(row.sourceRow) ?? row.term
    return {
      ...row,
      definition: DEFINITION_CORRECTIONS.get(row.sourceRow) ?? row.definition,
      ipa: IPA_CORRECTIONS.get(row.sourceRow) ?? row.ipa,
      normalizedTerm: normalizeTerm(correctedTerm, row.topic),
    }
  })
  const groups = groupBy(normalizedRows, (row) => `${slugify(row.topic)}::${key(row.normalizedTerm)}`)
  return [...groups.values()].map((rowsInGroup) => {
    const first = rowsInGroup[0]
    const previous = rowsInGroup
      .map((row) => previousBySourceRow.get(row.sourceRow))
      .find((row) => row?.example && row?.exampleTranslation && key(row.example).includes(key(first.normalizedTerm)))
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
      exampleSource: previous ? 'preserved' : 'generated',
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
    examplesPreserved: records.filter((record) => record.exampleSource === 'preserved').length,
    examplesGenerated: records.filter((record) => record.exampleSource === 'generated').length,
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
