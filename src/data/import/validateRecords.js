export function getErrors(catalog) {
  return catalog.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
}

export function getWarnings(catalog) {
  return catalog.diagnostics.filter((diagnostic) => diagnostic.severity === 'warning')
}
