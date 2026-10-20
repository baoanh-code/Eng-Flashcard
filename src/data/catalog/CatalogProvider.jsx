import { useCallback, useMemo, useState } from 'react'
import { CatalogContext } from './catalogContext.js'
import { loadLevelCatalog } from './loadLevelCatalog.js'

const idleState = Object.freeze({ catalog: null, error: null, status: 'idle' })

export function CatalogProvider({ children }) {
  const [levelStates, setLevelStates] = useState({})

  const ensureLevel = useCallback((levelId) => {
    const normalizedLevel = String(levelId ?? '').toLocaleLowerCase('en')
    setLevelStates((current) => {
      if (current[normalizedLevel]?.status && current[normalizedLevel].status !== 'idle') return current
      return { ...current, [normalizedLevel]: { ...idleState, status: 'loading' } }
    })

    return loadLevelCatalog(normalizedLevel)
      .then((catalog) => {
        setLevelStates((current) => ({
          ...current,
          [normalizedLevel]: {
            catalog,
            error: null,
            status: catalog.records.length === 0 ? 'empty' : catalog.hasErrors ? 'partial' : 'ready',
          },
        }))
        return catalog
      })
      .catch((error) => {
        setLevelStates((current) => ({
          ...current,
          [normalizedLevel]: { catalog: null, error, status: 'error' },
        }))
        throw error
      })
  }, [])

  const value = useMemo(() => ({
    ensureLevel,
    getLevelState: (levelId) => levelStates[String(levelId ?? '').toLocaleLowerCase('en')] ?? idleState,
  }), [ensureLevel, levelStates])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
