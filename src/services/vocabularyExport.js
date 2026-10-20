function safeCell(value) {
  const text = String(value ?? '').replace(/\r\n?/g, '\n')
  return /^[=+\-@]/.test(text) ? `'${text}` : text
}

function csvCell(value) {
  const text = safeCell(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function serializeVocabulary(records, format) {
  if (format === 'tsv') return `\uFEFFTerm\tDefinition\n${records.map((record) => `${safeCell(record.term).replace(/[\t\n]+/g, ' ')}\t${safeCell(record.definition).replace(/[\t\n]+/g, ' ')}`).join('\n')}`
  const rows = records.map((record) => [record.term, record.definition, record.example ?? '', record.topic].map(csvCell).join(','))
  return `\uFEFFTerm,Definition,Example,Topic\n${rows.join('\n')}`
}

export function exportFilename(levelId, topicId, format) {
  return `${levelId}-${topicId || 'vocabulary'}.${format}`
}
