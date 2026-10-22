import { migrateProgress, PROGRESS_VERSION } from './storageMigrations.js'

export const PROGRESS_STORAGE_KEY = 'fl-eng.progress'
export const STUDY_MODES = Object.freeze(['flashcards', 'multiple-choice', 'writing', 'matching'])
export const STUDY_ORDERS = Object.freeze(['original', 'random'])

export function createDefaultStudyOrderByMode() {
  return Object.fromEntries(STUDY_MODES.map((mode) => [mode, 'original']))
}

export function createDefaultProgress() {
  return {
    version: PROGRESS_VERSION,
    learnedIds: [],
    reviewIds: [],
    lastSession: null,
    settings: { studyOrderByMode: createDefaultStudyOrderByMode() },
  }
}

function cleanIds(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id) => typeof id === 'string').map((id) => id.trim()).filter(Boolean))]
}

function cleanLastSession(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const { levelId, topicId, mode, updatedAt } = value
  if (![levelId, topicId, updatedAt].every((item) => typeof item === 'string' && item.trim())) return null
  if (!STUDY_MODES.includes(mode) || Number.isNaN(Date.parse(updatedAt))) return null
  return { levelId: levelId.trim(), topicId: topicId.trim(), mode, updatedAt }
}

export function sanitizeProgress(value) {
  const migrated = migrateProgress(value)
  if (!migrated) return createDefaultProgress()

  const learnedIds = cleanIds(migrated.learnedIds)
  const learnedSet = new Set(learnedIds)
  const reviewIds = cleanIds(migrated.reviewIds).filter((id) => !learnedSet.has(id))
  const storedOrders = migrated.settings?.studyOrderByMode
  const legacyOrder = migrated.settings?.studyOrder
  const studyOrderByMode = Object.fromEntries(STUDY_MODES.map((mode) => {
    const candidate = storedOrders?.[mode] ?? (mode === 'flashcards' ? legacyOrder : undefined)
    return [mode, STUDY_ORDERS.includes(candidate) ? candidate : 'original']
  }))

  return {
    version: PROGRESS_VERSION,
    learnedIds,
    reviewIds,
    lastSession: cleanLastSession(migrated.lastSession),
    settings: { studyOrderByMode },
  }
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage
  try { return globalThis.window?.localStorage ?? null } catch { return null }
}

export function loadProgress(storageInput) {
  const storage = resolveStorage(storageInput)
  if (!storage) return { progress: createDefaultProgress(), status: 'unavailable' }
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return { progress: createDefaultProgress(), status: 'ready' }
    const parsed = JSON.parse(raw)
    const migrated = migrateProgress(parsed)
    if (!migrated) return { progress: createDefaultProgress(), status: 'recovered' }
    return { progress: sanitizeProgress(migrated), status: 'ready' }
  } catch {
    return { progress: createDefaultProgress(), status: 'recovered' }
  }
}

export function saveProgress(progress, storageInput) {
  const storage = resolveStorage(storageInput)
  if (!storage) return { status: 'unavailable' }
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)))
    return { status: 'ready' }
  } catch {
    return { status: 'write-error' }
  }
}
