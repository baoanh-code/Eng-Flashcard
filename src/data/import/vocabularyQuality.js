const TEMPLATE_EXAMPLE = /\bIn this topic\b|\bmeans\b.+\bin Vietnamese\b|Trong chủ đề này|có nghĩa là.+trong tiếng Việt/iu
const SUSPICIOUS_OCR_TERM = /\b(?:afection|blindman'sbluf|braisedfsh|bufalofightingfestival|bufet|cockfghting|cofee|confdence|dafodil|desertifcation|dosonbufalofighting|fction|fdelity|firefghter|frecrackers|friedfsh|fsh|fshing|ftness|fttingroom|fve-fruittray|girafe|greenhouseefect|historicalfction|mooncakeflling|non-fction|ofce|ofside|policeofcer|proft|reunifcationday|sciencefction|terrifc|trafc|trafclight)\b/iu

function hasInvalidCharacter(value) {
  return [...value].some((character) => character === '\ufffd' || character.codePointAt(0) < 32)
}

export function findVocabularyQualityIssues(records) {
  const issues = []
  for (const record of records) {
    if (TEMPLATE_EXAMPLE.test(record.example ?? '') || TEMPLATE_EXAMPLE.test(record.exampleTranslation ?? '')) {
      issues.push({ id: record.id, type: 'template-example' })
    }
    if (!/[a-z]/iu.test(record.term) || hasInvalidCharacter(record.term) || SUSPICIOUS_OCR_TERM.test(record.term) || record.term !== record.term.trim() || /\s{2,}/u.test(record.term) || /^[,.;:!?]|[,.;:!?]$/u.test(record.term)) {
      issues.push({ id: record.id, type: 'malformed-term' })
    }
  }
  return issues
}
