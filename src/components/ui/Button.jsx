import { forwardRef } from 'react'

export const Button = forwardRef(function Button(
  { children, className = '', size = 'default', variant = 'primary', type = 'button', ...props },
  ref,
) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    size === 'large' ? 'ui-button--large' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button className={classes} ref={ref} type={type} {...props}>{children}</button>
})
