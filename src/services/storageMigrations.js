export const PROGRESS_VERSION = 1

const migrations = new Map([
  [0, (value) => ({
    version: 1,
    learnedIds: value.learnedIds ?? value.learned ?? [],
    reviewIds: value.reviewIds ?? value.review ?? [],
    lastSession: value.lastSession ?? null,
    settings: value.settings ?? { studyOrder: 'original' },
  })],
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
