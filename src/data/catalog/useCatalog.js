import { useContext, useEffect } from 'react'
import { CatalogContext } from './catalogContext.js'

export function useCatalog(levelId = 'general') {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider.')

  const state = context.getLevelState(levelId)
  useEffect(() => {
    if (state.status === 'idle') {
      void context.ensureLevel(levelId).catch(() => {
        // The provider exposes the failure as state; consumers should not receive
        // an unhandled promise rejection while rendering their recovery UI.
      })
    }
  }, [context, levelId, state.status])

  return state
}
