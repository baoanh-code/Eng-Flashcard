import { useEffect, useRef } from 'react'
import { Button } from './Button.jsx'

export function ConfirmDialog({ cancelLabel = 'Giữ nguyên', confirmLabel, description, onCancel, onConfirm, open, title }) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      triggerRef.current = document.activeElement
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function closeAndRestoreFocus() {
    onCancel()
    window.requestAnimationFrame(() => triggerRef.current?.focus?.())
  }

  function confirmAndRestoreFocus() {
    onConfirm()
    window.requestAnimationFrame(() => triggerRef.current?.focus?.())
  }

  return (
    <dialog
      aria-describedby="confirm-dialog-description"
      aria-labelledby="confirm-dialog-title"
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault()
        closeAndRestoreFocus()
      }}
      ref={dialogRef}
    >
      <div className="confirm-dialog__body">
        <div>
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        <div className="confirm-dialog__actions">
          <Button onClick={closeAndRestoreFocus} variant="secondary">{cancelLabel}</Button>
          <Button onClick={confirmAndRestoreFocus} variant="danger">{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  )
}
