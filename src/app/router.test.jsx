import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppProviders } from './providers.jsx'
import { AppRouter } from './router.jsx'

describe('application routes', () => {
  it('renders a nested route through the application shell', async () => {
    render(<MemoryRouter initialEntries={['/levels/general/topics']}><AppProviders><AppRouter /></AppProviders></MemoryRouter>)
    expect(await screen.findByRole('heading', { level: 1, name: 'Hôm nay bạn muốn nói về điều gì?' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument()
  })

  it('keeps legacy A2 bookmarks working through a redirect', async () => {
    render(<MemoryRouter initialEntries={['/levels/a2/topics']}><AppProviders><AppRouter /></AppProviders></MemoryRouter>)
    expect(await screen.findByRole('heading', { level: 1, name: 'Hôm nay bạn muốn nói về điều gì?' })).toBeInTheDocument()
  })

  it('renders the not found route', () => {
    render(<MemoryRouter initialEntries={['/khong-ton-tai']}><AppProviders><AppRouter /></AppProviders></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument()
  })
})
