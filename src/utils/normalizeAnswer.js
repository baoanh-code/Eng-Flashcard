export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')
}
