import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { ProgressBar } from './ProgressBar.jsx'
import { TextField } from './TextField.jsx'

describe('UI primitives', () => {
  it('exposes labelled progress values', () => {
    render(<ProgressBar label="Tiến độ chủ đề" max={100} value={32} valueText="32 trên 100" />)
    expect(screen.getByRole('progressbar', { name: 'Tiến độ chủ đề' })).toHaveAttribute('aria-valuenow', '32')
    expect(screen.getByText('32 trên 100')).toBeInTheDocument()
  })

  it('connects labels and errors to text fields', () => {
    render(<TextField error="Vui lòng nhập câu trả lời" label="Câu trả lời" />)
    const input = screen.getByLabelText('Câu trả lời')
    expect(input).toHaveAccessibleDescription('Vui lòng nhập câu trả lời')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('confirms a destructive action explicitly', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <>
        <Button>Open</Button>
        <ConfirmDialog
          confirmLabel="Đặt lại tiến độ"
          description="Tiến độ của chủ đề sẽ bị xóa trên thiết bị này."
          onCancel={() => {}}
          onConfirm={onConfirm}
          open
          title="Đặt lại chủ đề?"
        />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Đặt lại tiến độ' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
