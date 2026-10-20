export function downloadText(content, filename, format) {
  const type = format === 'tsv' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8'
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
