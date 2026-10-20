export const DiagnosticCode = Object.freeze({
  DUPLICATE_ID: 'DUPLICATE_ID',
  DUPLICATE_TERM: 'DUPLICATE_TERM',
  EMPTY_SOURCE: 'EMPTY_SOURCE',
  INVALID_LEVEL: 'INVALID_LEVEL',
  MALFORMED_HEADER: 'MALFORMED_HEADER',
  MALFORMED_ROW: 'MALFORMED_ROW',
  MISSING_DEFINITION: 'MISSING_DEFINITION',
  MISSING_TERM: 'MISSING_TERM',
  PARSE_FAILURE: 'PARSE_FAILURE',
  UNKNOWN_HEADER: 'UNKNOWN_HEADER',
  UNRESOLVED_TOPIC: 'UNRESOLVED_TOPIC',
})

export function createDiagnostic({ code, message, row = null, severity = 'error', source }) {
  return Object.freeze({ code, message, row, severity, source })
}
