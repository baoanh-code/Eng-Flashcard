import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { IconButton } from '../ui/IconButton.jsx'
import { MobileNav } from './MobileNav.jsx'
import { PageContainer } from './PageContainer.jsx'

const links = [
  { label: 'Chủ đề', to: '/levels/general/topics' },
  { label: 'Ôn tập', to: '/levels/general/review' },
  { label: 'Từ vựng', to: '/vocabulary?level=general' },
  { label: 'Tiến độ', to: '/levels/general/progress' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const hadOpened = useRef(false)

  useEffect(() => {
    if (open) hadOpened.current = true
    if (!open && hadOpened.current) buttonRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="app-header">
      <PageContainer className="header-inner">
        <Link className="brand-link" to="/">
          <span className="brand-mark">EN</span>
          <span>Vocabulary</span>
        </Link>

        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {links.map((link) => (
            <NavLink className="nav-link" key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
        </nav>

        <IconButton
          aria-controls="mobile-navigation"
          aria-expanded={open}
          className="mobile-menu-button"
          label={open ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setOpen((value) => !value)}
          ref={buttonRef}
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </IconButton>

        {open ? <div id="mobile-navigation"><MobileNav links={links} onNavigate={() => setOpen(false)} /></div> : null}
      </PageContainer>
    </header>
  )
}
