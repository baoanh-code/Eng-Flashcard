import Papa from 'papaparse'
import { createDiagnostic, DiagnosticCode } from './diagnostics.js'
import { hasRecognizedHeader, resolveHeader } from './headerAliases.js'
import { normalizeDisplayText } from './normalizeText.js'

function sourceExtension(path) {
  return path.toLocaleLowerCase('en').split('.').pop()
}

function isEmptyRow(row) {
  return row.every((cell) => !normalizeDisplayText(cell))
}

function parseRaw(text, delimiter) {
  return Papa.parse(String(text ?? '').replace(/^\uFEFF/, ''), {
    delimiter,
    dynamicTyping: false,
    skipEmptyLines: 'greedy',
  })
}

function mapHeaderRow(headerValues, source, diagnostics) {
  const fields = []
  const seen = new Set()

  headerValues.forEach((header, index) => {
    const field = resolveHeader(header)
    fields[index] = field
    if (!normalizeDisplayText(header)) return

    if (!field) {
      diagnostics.push(createDiagnostic({
        code: DiagnosticCode.UNKNOWN_HEADER,
        message: `Unrecognized column “${normalizeDisplayText(header)}” will be ignored.`,
        row: 1,
        severity: 'warning',
        source,
      }))
      return
    }

    if (seen.has(field)) {
      diagnostics.push(createDiagnostic({
        code: DiagnosticCode.MALFORMED_HEADER,
        message: `More than one column maps to “${field}”.`,
        row: 1,
        source,
      }))
    }
    seen.add(field)
  })

  if (!seen.has('term') || !seen.has('definition')) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.MALFORMED_HEADER,
      message: 'CSV/TSV header must include recognizable Term and Definition columns.',
      row: 1,
      source,
    }))
  }

  return fields
}

function rowsFromHeaders(data, fields, source, startIndex, diagnostics) {
  const rows = []
  for (let dataIndex = startIndex; dataIndex < data.length; dataIndex += 1) {
    const cells = data[dataIndex]
    if (!Array.isArray(cells) || isEmptyRow(cells)) continue
    const values = {}

    cells.forEach((cell, columnIndex) => {
      const field = fields[columnIndex]
      if (field) values[field] = cell
      else if (normalizeDisplayText(cell) && columnIndex >= fields.length) {
        diagnostics.push(createDiagnostic({
          code: DiagnosticCode.MALFORMED_ROW,
          message: 'Row contains more values than the recognized header.',
          row: dataIndex + 1,
          severity: 'warning',
          source,
        }))
      }
    })

    rows.push({ row: dataIndex + 1, values })
  }
  return rows
}

export function parseSource({ path, text }) {
  const diagnostics = []
  const extension = sourceExtension(path)
  const delimiter = extension === 'tsv' ? '\t' : ','
  const result = parseRaw(text, delimiter)

  for (const error of result.errors) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.PARSE_FAILURE,
      message: error.message,
      row: Number.isInteger(error.row) ? error.row + 1 : null,
      source: path,
    }))
  }

  const data = Array.isArray(result.data) ? result.data.filter(Array.isArray) : []
  if (data.length === 0) {
    diagnostics.push(createDiagnostic({
      code: DiagnosticCode.EMPTY_SOURCE,
      message: 'Vocabulary source does not contain any non-empty rows.',
      source: path,
    }))
    return { diagnostics, rows: [] }
  }

  if (extension === 'tsv' && !hasRecognizedHeader(data[0])) {
    const rows = data
      .filter((cells) => !isEmptyRow(cells))
      .map((cells, index) => {
        if (cells.slice(2).some((cell) => normalizeDisplayText(cell))) {
          diagnostics.push(createDiagnostic({
            code: DiagnosticCode.MALFORMED_ROW,
            message: 'Headerless TSV uses only the first two columns; extra values were ignored.',
            row: index + 1,
            severity: 'warning',
            source: path,
          }))
        }
        return { row: index + 1, values: { term: cells[0], definition: cells[1] } }
      })
    return { diagnostics, rows }
  }

  const fields = mapHeaderRow(data[0], path, diagnostics)
  return { diagnostics, rows: rowsFromHeaders(data, fields, path, 1, diagnostics) }
}
