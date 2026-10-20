import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

export function RouteAnnouncer() {
  const location = useLocation()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    let observer
    function focusRouteHeading() {
      const heading = document.querySelector('main h1')
      if (!heading) return false
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      setAnnouncement(heading.textContent?.trim() || document.title)
      heading.focus({ preventScroll: true })
      observer?.disconnect()
      return true
    }

    const frame = window.requestAnimationFrame(() => {
      if (focusRouteHeading()) return
      const main = document.querySelector('main')
      if (!main) return
      observer = new MutationObserver(focusRouteHeading)
      observer.observe(main, { childList: true, subtree: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [location.pathname])

  return <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
}
