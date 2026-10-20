export function normalizeDisplayText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/^\uFEFF/, '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
}

export function normalizeKey(value) {
  return normalizeDisplayText(value).toLocaleLowerCase('en')
}

export function normalizeHeaderKey(value) {
  return normalizeKey(value).replace(/[^a-z0-9]/g, '')
}

export function slugify(value) {
  return normalizeDisplayText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function humanizeFilename(value) {
  return normalizeDisplayText(value)
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
