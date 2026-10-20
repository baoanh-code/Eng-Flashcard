import { useEffect, useMemo, useReducer, useState } from 'react'
import { loadProgress, saveProgress } from '../../services/progressStorage.js'
import { ProgressContext } from './progressContext.js'
import { progressReducer } from './progressReducer.js'

export function ProgressProvider({ children, storage }) {
  const [initial] = useState(() => loadProgress(storage))
  const [state, dispatch] = useReducer(progressReducer, initial.progress)
  const [persistenceStatus, setPersistenceStatus] = useState(initial.status)

  useEffect(() => {
    const result = saveProgress(state, storage)
    // Persistence is an external system; surface its latest availability to UI consumers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersistenceStatus(result.status)
  }, [state, storage])

  const value = useMemo(() => ({
    dispatch,
    learnedSet: new Set(state.learnedIds),
    persistenceStatus,
    reviewSet: new Set(state.reviewIds),
    state,
  }), [persistenceStatus, state])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
