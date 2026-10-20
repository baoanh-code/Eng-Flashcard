import { NavLink } from 'react-router'
import { useEffect, useRef } from 'react'

export function MobileNav({ links, onNavigate }) {
  const firstLinkRef = useRef(null)
  useEffect(() => { firstLinkRef.current?.focus() }, [])
  return (
    <nav className="mobile-nav" aria-label="Điều hướng trên thiết bị di động">
      {links.map((link) => (
        <NavLink
          className="nav-link"
          key={link.to}
          onClick={onNavigate}
          ref={link === links[0] ? firstLinkRef : undefined}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
