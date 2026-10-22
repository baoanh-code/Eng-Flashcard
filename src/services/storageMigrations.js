import { generateVocabularyId } from '../data/import/generateVocabularyId.js'

export const PROGRESS_VERSION = 3

const studyModes = ['flashcards', 'multiple-choice', 'writing', 'matching']

const correctedTerms = [
  ['environment', 'desertifcation', 'desertification'],
  ['environment', 'greenhouseefect', 'greenhouse effect'],
  ['personality', 'afection', 'affection'],
  ['personality', 'confdence', 'confidence'],
  ['emotions', 'terrifc', 'terrific'],
  ['love', 'afection', 'affection'],
  ['love', 'fdelity', 'fidelity'],
  ['food', 'bufet', 'buffet'],
  ['drinks', 'cofee', 'coffee'],
  ['seafood', 'fsh', 'fish'],
  ['vietnamese-dishes', 'braisedfsh', 'braised fish'],
  ['vietnamese-dishes', 'friedfsh', 'fried fish'],
  ['hobbies', 'fshing', 'fishing'],
  ['shopping', 'fttingroom', 'fitting room'],
  ['film-genres', 'sciencefction', 'science fiction'],
  ['book-genres', 'fction', 'fiction'],
  ['book-genres', 'non-fction', 'non-fiction'],
  ['book-genres', 'sciencefction', 'science fiction'],
  ['book-genres', 'historicalfction', 'historical fiction'],
  ['sports', 'ftness', 'fitness'],
  ['football', 'ofside', 'offside'],
  ['tet', 'frecrackers', 'firecrackers'],
  ['tet', 'fve-fruittray', 'five-fruit tray'],
  ['animals', 'girafe', 'giraffe'],
  ['animals', 'fsh', 'fish'],
  ['flowers', 'dafodil', 'daffodil'],
  ['traffic-signs', 'trafclight', 'traffic light'],
  ['jobs', 'policeofcer', 'police officer'],
  ['jobs', 'firefghter', 'firefighter'],
  ['vietnamese-festivals', 'bufalofightingfestival', 'buffalo fighting festival'],
  ['vietnamese-festivals', 'reunifcationday', 'reunification day'],
  ['vietnamese-festivals', 'dosonbufalofighting festival', 'do son buffalo fighting festival'],
  ['mid-autumn-festival', 'mooncakeflling', 'mooncake filling'],
  ['folk-games', "blindman'sbluf", "blind man's bluff"],
  ['folk-games', 'cockfghting', 'cockfighting'],
  ['business', 'proft', 'profit'],
  ['city', 'trafc', 'traffic'],
  ['office-life', 'ofce', 'office'],
]

const correctedIds = new Map(correctedTerms.map(([topicId, before, after]) => [
  generateVocabularyId({ level: 'general', topicId, term: before }),
  generateVocabularyId({ level: 'general', topicId, term: after }),
]))

function migrateCorrectedIds(ids) {
  return Array.isArray(ids) ? ids.map((id) => correctedIds.get(id) ?? id) : ids
}

const migrations = new Map([
  [0, (value) => ({
    version: 1,
    learnedIds: value.learnedIds ?? value.learned ?? [],
    reviewIds: value.reviewIds ?? value.review ?? [],
    lastSession: value.lastSession ?? null,
    settings: value.settings ?? { studyOrder: 'original' },
  })],
  [1, (value) => ({
    ...value,
    version: 2,
    learnedIds: migrateCorrectedIds(value.learnedIds),
    reviewIds: migrateCorrectedIds(value.reviewIds),
  })],
  [2, (value) => {
    const { studyOrder: legacyOrder, ...otherSettings } = value.settings ?? {}
    return {
      ...value,
      version: 3,
      settings: {
        ...otherSettings,
        studyOrderByMode: Object.fromEntries(studyModes.map((mode) => [
          mode,
          mode === 'flashcards' && legacyOrder ? legacyOrder : 'original',
        ])),
      },
    }
  }],
])

export function migrateProgress(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (value.version === PROGRESS_VERSION) return value
  if (!Number.isInteger(value.version) || value.version > PROGRESS_VERSION) return null

  let current = value
  while (current.version < PROGRESS_VERSION) {
    const migrate = migrations.get(current.version)
    if (!migrate) return null
    current = migrate(current)
  }
  return current
}
