import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { WritingMode } from '../writing/WritingMode.jsx'
import { StudyOrderControl } from './StudyOrderControl.jsx'

const records = [
  { id: 'a', term: 'alpha', definition: 'nghĩa a' },
  { id: 'b', term: 'bravo', definition: 'nghĩa b' },
  { id: 'c', term: 'charlie', definition: 'nghĩa c' },
  { id: 'd', term: 'delta', definition: 'nghĩa d' },
]

function WritingHarness({ sessionRandom }) {
  const [order, setOrder] = useState('original')
  return <WritingMode levelId="general" topicId="test" records={records} order={order} onOrderChange={setOrder} sessionRandom={sessionRandom} />
}

describe('StudyOrderControl', () => {
  it('shows Xáo lại only for random order', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onReshuffle = vi.fn()
    const { rerender } = render(<StudyOrderControl value="original" onChange={onChange} onReshuffle={onReshuffle} />)

    expect(screen.queryByRole('button', { name: 'Xáo lại' })).not.toBeInTheDocument()
    rerender(<StudyOrderControl value="random" onChange={onChange} onReshuffle={onReshuffle} />)
    await user.click(screen.getByRole('button', { name: 'Xáo lại' }))
    expect(onReshuffle).toHaveBeenCalledOnce()
  })

  it('regenerates only on an explicit order change or reshuffle, not on rerender', async () => {
    const user = userEvent.setup()
    let randomValue = 0
    const sessionRandom = vi.fn(() => randomValue)
    const { rerender } = render(<WritingHarness sessionRandom={sessionRandom} />)

    expect(screen.getByRole('heading', { level: 2, name: 'nghĩa a' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Thứ tự'), 'random')
    expect(screen.getByRole('heading', { level: 2, name: 'nghĩa b' })).toBeInTheDocument()
    expect(sessionRandom).toHaveBeenCalledTimes(3)

    rerender(<WritingHarness sessionRandom={sessionRandom} />)
    expect(screen.getByRole('heading', { level: 2, name: 'nghĩa b' })).toBeInTheDocument()
    expect(sessionRandom).toHaveBeenCalledTimes(3)

    randomValue = 0.5
    await user.click(screen.getByRole('button', { name: 'Xáo lại' }))
    expect(screen.getByRole('heading', { level: 2, name: 'nghĩa a' })).toBeInTheDocument()
    expect(sessionRandom).toHaveBeenCalledTimes(6)
  })
})
