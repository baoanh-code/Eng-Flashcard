import { forwardRef } from 'react'
import { Button } from './Button.jsx'

export const IconButton = forwardRef(function IconButton({ children, label, className = '', ...props }, ref) {
  return (
    <Button
      aria-label={label}
      className={`icon-button ${className}`.trim()}
      ref={ref}
      variant="secondary"
      {...props}
    >
      {children}
    </Button>
  )
})
