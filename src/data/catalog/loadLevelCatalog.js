import { buildCatalog } from '../import/buildCatalog.js'
import { topicMetadataByLevel } from '../topics/general.js'
import { vocabularySourceLoaders } from './sourceLoaders.js'

const catalogCache = new Map()

export function loadLevelCatalog(levelId) {
  const normalizedLevel = String(levelId ?? '').toLocaleLowerCase('en')
  if (catalogCache.has(normalizedLevel)) return catalogCache.get(normalizedLevel)

  const matchingLoaders = Object.entries(vocabularySourceLoaders)
    .filter(([path]) => path.replace(/\\/g, '/').includes(`/vocabulary/${normalizedLevel}/`))

  const promise = Promise.all(
    matchingLoaders.map(async ([path, loader]) => ({ path, text: await loader() })),
  ).then((sources) => buildCatalog(sources, topicMetadataByLevel))

  catalogCache.set(normalizedLevel, promise)
  return promise
}

export function clearCatalogCacheForTests() {
  catalogCache.clear()
}
