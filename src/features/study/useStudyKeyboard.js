import { useEffect } from 'react'
import { isEditableTarget } from '../../utils/isEditableTarget.js'

export function useStudyKeyboard(handlers) {
  useEffect(() => {
    function onKeyDown(event) {
      if (isEditableTarget(event)) return
      const handler = handlers[event.key]
      if (handler) { event.preventDefault(); handler() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}
