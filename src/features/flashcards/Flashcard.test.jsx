import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Flashcard } from './Flashcard.jsx'

const pronounceEnglishTerm = vi.fn()
vi.mock('../../services/pronunciation.js', () => ({ pronounceEnglishTerm: (...args) => pronounceEnglishTerm(...args) }))

const record = {
  term: 'pottery',
  definition: 'đồ gốm',
  example: 'She makes pottery by hand.',
  exampleTranslation: 'Cô ấy làm đồ gốm bằng tay.',
  level: 'general',
  partOfSpeech: 'noun',
  ipa: '/ˈpɒtəri/',
}

describe('Flashcard', () => {
  beforeEach(() => pronounceEnglishTerm.mockClear())

  it('pronounces the current term without flipping the card', () => {
    const onFlip = vi.fn()
    render(<Flashcard record={record} flipped={false} onFlip={onFlip} />)
    fireEvent.click(screen.getByRole('button', { name: /Pronounce pottery/ }))
    expect(pronounceEnglishTerm).toHaveBeenCalledWith('pottery')
    expect(onFlip).not.toHaveBeenCalled()
    expect(screen.queryByText('đồ gốm')).not.toBeInTheDocument()
  })

  it('flips only from the card control', () => {
    const onFlip = vi.fn()
    const { container } = render(<Flashcard record={record} flipped={false} onFlip={onFlip} />)
    fireEvent.click(container.querySelector('.flashcard'))
    expect(onFlip).toHaveBeenCalledOnce()
  })
})
