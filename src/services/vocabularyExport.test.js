import { describe, expect, it } from 'vitest'
import { exportFilename, serializeVocabulary } from './vocabularyExport.js'

const records = [{ term: '=SUM(1,2)', definition: 'công thức, nguy hiểm', example: 'He said "hello".\nThen left.', topic: 'Examples' }]

describe('vocabulary export', () => {
  it('emits BOM CSV with quoting and spreadsheet-injection protection', () => {
    const output = serializeVocabulary(records, 'csv')
    expect(output.startsWith('\uFEFFTerm,Definition,Example,Topic')).toBe(true)
    expect(output).toContain('"\'=SUM(1,2)"')
    expect(output).toContain('"công thức, nguy hiểm"')
    expect(output).toContain('"He said ""hello"".\nThen left."')
  })

  it('normalizes tabs/newlines for TSV and uses deterministic filenames', () => {
    const output = serializeVocabulary([{ term: 'ice\tcream', definition: 'kem\nlạnh' }], 'tsv')
    expect(output).toBe('\uFEFFTerm\tDefinition\nice cream\tkem lạnh')
    expect(exportFilename('a2', 'food', 'tsv')).toBe('a2-food.tsv')
  })
})
