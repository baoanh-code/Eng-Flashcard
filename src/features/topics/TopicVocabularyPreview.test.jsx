import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopicVocabularyPreview } from './TopicVocabularyPreview.jsx'

describe('TopicVocabularyPreview', () => {
  it('renders every word directly and has no view-all action', () => {
    const records = Array.from({ length: 8 }, (_, index) => ({ id: String(index), term: `term ${index}`, definition: `nghĩa ${index}` }))
    render(<TopicVocabularyPreview records={records} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(screen.queryByRole('link', { name: /Xem tất cả/i })).not.toBeInTheDocument()
  })
})
