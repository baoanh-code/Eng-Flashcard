import { forwardRef, useId } from 'react'

export const TextField = forwardRef(function TextField(
  { error, hint, id: providedId, label, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="field-input"
        id={id}
        ref={ref}
        {...props}
      />
      {hint ? <span id={hintId}>{hint}</span> : null}
      {error ? <span className="field-error" id={errorId}>{error}</span> : null}
    </div>
  )
})
