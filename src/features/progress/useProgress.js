import { useContext } from 'react'
import { ProgressContext } from './progressContext.js'

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider.')
  return context
}
