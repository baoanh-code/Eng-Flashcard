import { describe, expect, it } from 'vitest'
import { buildCatalog } from './buildCatalog.js'
import { DiagnosticCode } from './diagnostics.js'

const metadata = {
  a2: [
    {
      id: 'education',
      level: 'a2',
      name: 'Education & Learning',
      description: 'Từ vựng học tập.',
      icon: 'book-open',
      sourceAliases: ['education'],
      nameAliases: ['Education'],
    },
  ],
}

function source(text, name = 'education.csv') {
  return { path: `src/data/vocabulary/a2/${name}`, text }
}

describe('buildCatalog', () => {
  it('parses quoted CSV, preserves UTF-8 and normalizes the canonical shape', () => {
    const catalog = buildCatalog([
      source('\uFEFFTerm,Definition,Example,Example Translation,IPA,Part of Speech,Topic\r\n"library","thư viện","The library has books, maps, and computers.","Thư viện có sách, bản đồ và máy tính.","/ˈlaɪ.brər.i/",noun,Education'),
    ], metadata)

    expect(catalog.hasErrors).toBe(false)
    expect(catalog.records).toEqual([
      {
        id: 'a2-education-library',
        level: 'a2',
        topicId: 'education',
        topic: 'Education & Learning',
        term: 'library',
        definition: 'thư viện',
        example: 'The library has books, maps, and computers.',
        exampleTranslation: 'Thư viện có sách, bản đồ và máy tính.',
        ipa: '/ˈlaɪ.brər.i/',
        partOfSpeech: 'noun',
      },
    ])
  })

  it('imports the first line of a headerless two-column TSV as data', () => {
    const catalog = buildCatalog([
      source('teacher\tgiáo viên\nstudent\thọc sinh', 'education.tsv'),
    ], metadata)

    expect(catalog.records).toHaveLength(2)
    expect(catalog.records[0]).toMatchObject({
      term: 'teacher',
      definition: 'giáo viên',
      example: null,
      exampleTranslation: null,
      ipa: null,
      partOfSpeech: null,
    })
  })

  it('treats a partially recognized TSV header as malformed instead of data', () => {
    const catalog = buildCatalog([source('Term\tUnknown\nteacher\tgiáo viên', 'education.tsv')], metadata)
    expect(catalog.diagnostics.some((item) => item.code === DiagnosticCode.MALFORMED_HEADER)).toBe(true)
    expect(catalog.records).toHaveLength(0)
  })

  it('keeps IDs stable across definition, example and display-topic changes', () => {
    const first = buildCatalog([
      source('Term,Definition,Example\nclassroom,lớp học,This is my classroom.'),
    ], metadata)
    const renamedMetadata = {
      a2: [{ ...metadata.a2[0], name: 'Learning', description: 'Đã đổi.' }],
    }
    const second = buildCatalog([
      source('Term,Definition,Example\nclassroom,phòng học,Our classroom is bright.'),
    ], renamedMetadata)

    expect(first.records[0].id).toBe(second.records[0].id)
    expect(second.records[0].topic).toBe('Learning')
  })

  it('reports row errors while retaining unrelated valid records', () => {
    const catalog = buildCatalog([
      source('Term,Definition,Level\nbook,sách,A2\n,thiếu từ,A2\npen,,A2\nruler,thước,B1'),
    ], metadata)

    expect(catalog.records.map((record) => record.term)).toEqual(['book'])
    expect(catalog.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining([
      DiagnosticCode.MISSING_TERM,
      DiagnosticCode.MISSING_DEFINITION,
      DiagnosticCode.INVALID_LEVEL,
    ]))
  })

  it('detects normalized duplicate terms and punctuation slug collisions', () => {
    const duplicate = buildCatalog([
      source('Term,Definition\nTeacher,giáo viên\n teacher ,thầy giáo'),
    ], metadata)
    const collision = buildCatalog([
      source("Term,Definition\ncan't,không thể\ncant,lời nói sáo rỗng"),
    ], metadata)

    expect(duplicate.diagnostics.some((item) => item.code === DiagnosticCode.DUPLICATE_TERM)).toBe(true)
    expect(collision.diagnostics.some((item) => item.code === DiagnosticCode.DUPLICATE_ID)).toBe(true)
    expect(collision.records).toHaveLength(1)
  })

  it('builds level, topic and search indexes for 5,000 records', () => {
    const rows = ['Term,Definition']
    for (let index = 0; index < 5000; index += 1) rows.push(`word ${index},nghĩa ${index}`)

    const catalog = buildCatalog([source(rows.join('\n'))], metadata)

    expect(catalog.records).toHaveLength(5000)
    expect(catalog.indexes.byLevel.get('a2')).toHaveLength(5000)
    expect(catalog.indexes.byTopic.get('a2:education')).toHaveLength(5000)
    expect(catalog.indexes.searchIndex.get('a2-education-word-4999')).toEqual({
      definition: 'nghĩa 4999',
      term: 'word 4999',
    })
    expect(catalog.topics[0].totalWords).toBe(5000)
  })
})
