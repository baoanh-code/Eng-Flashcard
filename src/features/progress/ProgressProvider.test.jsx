import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { describe, expect, it } from 'vitest'
import { PROGRESS_STORAGE_KEY } from '../../services/progressStorage.js'
import { ProgressProvider } from './ProgressProvider.jsx'
import { useProgress } from './useProgress.js'

function Harness() {
  const { dispatch, state } = useProgress()
  return (
    <>
      <output>{state.learnedIds.join(',')}</output>
      <button type="button" onClick={() => dispatch({ type: 'markLearned', id: 'word-1' })}>Learn</button>
    </>
  )
}

describe('ProgressProvider', () => {
  it('persists semantic changes and hydrates them on remount under StrictMode', async () => {
    const user = userEvent.setup()
    const values = new Map()
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    }
    const first = render(<StrictMode><ProgressProvider storage={storage}><Harness /></ProgressProvider></StrictMode>)
    await user.click(screen.getByRole('button', { name: 'Learn' }))
    expect(screen.getByText('word-1')).toBeInTheDocument()
    expect(JSON.parse(values.get(PROGRESS_STORAGE_KEY)).learnedIds).toEqual(['word-1'])
    first.unmount()

    render(<ProgressProvider storage={storage}><Harness /></ProgressProvider>)
    expect(screen.getByText('word-1')).toBeInTheDocument()
  })
})
