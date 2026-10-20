import { useRef } from 'react'
import { useLocation } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta.js'

export function PlaceholderPage({ title, description }) {
  const headingRef = useRef(null)
  const location = useLocation()
  usePageMeta(title)

  return (
    <section className="placeholder-page" aria-labelledby="page-title" data-route={location.pathname}>
      <h1 id="page-title" ref={headingRef} tabIndex="-1">{title}</h1>
      <p>{description}</p>
    </section>
  )
}
