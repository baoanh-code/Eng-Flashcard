import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useStudyKeyboard } from './useStudyKeyboard.js'

function Harness({ handlers }) {
  useStudyKeyboard(handlers)
  return <><button type="button">Focused action</button><input aria-label="Answer" /></>
}

describe('useStudyKeyboard', () => {
  it('handles ArrowLeft, ArrowRight, and Space outside editable controls', () => {
    const handlers = { ArrowLeft: vi.fn(), ArrowRight: vi.fn(), ' ': vi.fn() }
    render(<Harness handlers={handlers} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: ' ' })
    expect(handlers.ArrowLeft).toHaveBeenCalledOnce()
    expect(handlers.ArrowRight).toHaveBeenCalledOnce()
    expect(handlers[' ']).toHaveBeenCalledOnce()
  })

  it('ignores shortcuts from editable fields and focused controls', () => {
    const handlers = { ArrowLeft: vi.fn(), ' ': vi.fn() }
    render(<Harness handlers={handlers} />)
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Answer' }), { key: 'ArrowLeft' })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Focused action' }), { key: ' ' })
    expect(handlers.ArrowLeft).not.toHaveBeenCalled()
    expect(handlers[' ']).not.toHaveBeenCalled()
  })
})
